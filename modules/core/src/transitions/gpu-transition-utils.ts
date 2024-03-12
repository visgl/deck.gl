import type {Device, Buffer, VertexFormat} from '@luma.gl/core';
import {padArray} from '../utils/array-utils';
import {NumericArray, TypedArray, TypedArrayConstructor} from '../types/types';
import Attribute from '../lib/attribute/attribute';
import type {BufferAccessor} from '../lib/attribute/data-column';
import {GL} from '@luma.gl/constants';

// NOTE: NOT COPYING OVER OFFSET OR STRIDE HERE BECAUSE:
// (1) WE DON'T SUPPORT INTERLEAVED BUFFERS FOR TRANSITIONS
// (2) BUFFERS WITH OFFSETS ALWAYS CONTAIN VALUES OF THE SAME SIZE
// (3) THE OPERATIONS IN THE SHADER ARE PER-COMPONENT (addition and scaling)
export function getSourceBufferAttribute(
  device: Device,
  attribute: Attribute
): [Buffer, BufferAccessor] | NumericArray {
  // The Attribute we pass to Transform as a sourceBuffer must have {divisor: 0}
  // so we create a copy of the attribute (with divisor=0) to use when running
  // transform feedback
  const buffer = attribute.getBuffer();
  if (buffer) {
    return [
      buffer,
      {
        divisor: 0,
        size: attribute.size,
        normalized: attribute.settings.normalized
      } as BufferAccessor
    ];
  }
  // constant
  // don't pass normalized here because the `value` from a normalized attribute is
  // already normalized
  return attribute.value as NumericArray;
}

/** Returns the GLSL attribute type for the given number of float32 components. */
export function getAttributeTypeFromSize(size: number): string {
  switch (size) {
    case 1:
      return 'float';
    case 2:
      return 'vec2';
    case 3:
      return 'vec3';
    case 4:
      return 'vec4';
    default:
      throw new Error(`No defined attribute type for size "${size}"`);
  }
}

/** Returns the {@link VertexFormat} for the given number of float32 components. */
export function getFloat32VertexFormat(size: number): VertexFormat {
  switch (size) {
    case 1:
      return 'float32';
    case 2:
      return 'float32x2';
    case 3:
      return 'float32x3';
    case 4:
      return 'float32x4';
    default:
      throw new Error('invalid type size');
  }
}

export function cycleBuffers(buffers: Buffer[]): void {
  buffers.push(buffers.shift() as Buffer);
}

export function getAttributeBufferLength(attribute: Attribute, numInstances: number): number {
  const {doublePrecision, settings, value, size} = attribute;
  const multiplier = doublePrecision && value instanceof Float64Array ? 2 : 1;
  let maxVertexOffset = 0;
  const {shaderAttributes} = attribute.settings;
  if (shaderAttributes) {
    for (const shaderAttribute of Object.values(shaderAttributes)) {
      maxVertexOffset = Math.max(maxVertexOffset, shaderAttribute.vertexOffset ?? 0);
    }
  }
  return (
    (settings.noAlloc ? (value as NumericArray).length : (numInstances + maxVertexOffset) * size) *
    multiplier
  );
}

// This helper is used when transitioning attributes from a set of values in one buffer layout
// to a set of values in a different buffer layout. (Buffer layouts are used when attribute values
// within a buffer should be grouped for drawElements, like the Polygon layer.) For example, a
// buffer layout of [3, 4] might have data [A1, A2, A3, B1, B2, B3, B4]. If it needs to transition
// to a buffer layout of [4, 2], it should produce a buffer, using the transition setting's `enter`
// function, that looks like this: [A1, A2, A3, A4 (user `enter` fn), B1, B2, 0]. Note: the final
// 0 in this buffer is because we never shrink buffers, only grow them, for performance reasons.
//
// padBuffer may return either the original buffer, or a new buffer if the size of the original
// was insufficient. Callers are responsible for disposing of the original buffer if needed.
export function padBuffer({
  buffer,
  attribute,
  fromLength,
  toLength,
  fromStartIndices,
  getData = x => x
}: {
  buffer: Buffer;
  attribute: Attribute;
  fromLength: number;
  toLength: number;
  fromStartIndices?: NumericArray | null;
  getData?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
}): Buffer {
  // TODO: move the precisionMultiplier logic to the attribute when retrieving
  // its `size` and `elementOffset`?
  const precisionMultiplier =
    attribute.doublePrecision && attribute.value instanceof Float64Array ? 2 : 1;
  const size = attribute.size * precisionMultiplier;
  const byteOffset = attribute.byteOffset;
  const targetByteOffset =
    attribute.settings.bytesPerElement < 4
      ? (byteOffset / attribute.settings.bytesPerElement) * 4
      : byteOffset;
  const toStartIndices = attribute.startIndices;
  const hasStartIndices = fromStartIndices && toStartIndices;
  const isConstant = attribute.isConstant;

  // check if buffer needs to be padded
  if (!hasStartIndices && fromLength >= toLength) {
    return buffer;
  }

  const ArrayType =
    attribute.value instanceof Float64Array
      ? Float32Array
      : ((attribute.value as TypedArray).constructor as TypedArrayConstructor);
  const toData = isConstant
    ? (attribute.value as TypedArray)
    : // TODO(v9.1): Avoid non-portable synchronous reads.
      new ArrayType(
        attribute
          .getBuffer()!
          .readSyncWebGL(byteOffset, toLength * ArrayType.BYTES_PER_ELEMENT).buffer
      );
  if (attribute.settings.normalized && !isConstant) {
    const getter = getData;
    getData = (value, chunk) => attribute.normalizeConstant(getter(value, chunk));
  }

  const getMissingData = isConstant
    ? (i: number, chunk: NumericArray) => getData(toData, chunk)
    : (i: number, chunk: NumericArray) =>
        getData(toData.subarray(i + byteOffset, i + byteOffset + size), chunk);

  // TODO(v9.1): Avoid non-portable synchronous reads.
  const source = new Float32Array(buffer.readSyncWebGL(0, fromLength * 4).buffer);
  const target = new Float32Array(toLength);
  padArray({
    source,
    target,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size,
    getData: getMissingData
  });

  if (buffer.byteLength < target.byteLength + targetByteOffset) {
    buffer = buffer.device.createBuffer({
      byteLength: target.byteLength + targetByteOffset,
      usage: GL.DYNAMIC_COPY
    });
  }
  buffer.write(target, targetByteOffset);
  return buffer;
}
