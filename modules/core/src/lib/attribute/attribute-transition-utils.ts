import type {Device} from '@luma.gl/core';
import type {Buffer} from '@luma.gl/core';
import {padArray} from '../../utils/array-utils';
import {NumericArray, TypedArray} from '../../types/types';
import Attribute from './attribute';
import type {BufferAccessor} from './data-column';
import {VertexFormat as LumaVertexFormat} from '@luma.gl/core';

export interface TransitionSettings {
  type: string;
  /** Callback to get the value that the entering vertices are transitioning from. */
  enter?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
  /** Callback when the transition is started */
  onStart?: () => void;
  /** Callback when the transition is done */
  onEnd?: () => void;
  /** Callback when the transition is interrupted */
  onInterrupt?: () => void;
}

export type InterpolationTransitionSettings = TransitionSettings & {
  type?: 'interpolation';
  /** Duration of the transition animation, in milliseconds */
  duration: number;
  /** Easing function that maps a value from [0, 1] to [0, 1], see [http://easings.net/](http://easings.net/) */
  easing?: (t: number) => number;
};

export type SpringTransitionSettings = TransitionSettings & {
  type: 'spring';
  /** "Tension" factor for the spring */
  stiffness: number;
  /** "Friction" factor that counteracts the spring's acceleration */
  damping: number;
};

const DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: t => t
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};

export function normalizeTransitionSettings(
  userSettings: number | InterpolationTransitionSettings | SpringTransitionSettings,
  layerSettings?: boolean | Partial<TransitionSettings>
): TransitionSettings | null {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = {type: 'interpolation', duration: userSettings as number};
  }
  const type = (userSettings as TransitionSettings).type || 'interpolation';
  return {
    ...DEFAULT_TRANSITION_SETTINGS[type],
    ...(layerSettings as TransitionSettings),
    ...(userSettings as TransitionSettings),
    type
  };
}

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
export function getFloat32VertexFormat(size: 1 | 2 | 3 | 4): LumaVertexFormat {
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
  return (settings.noAlloc ? (value as NumericArray).length : numInstances * size) * multiplier;
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
  numInstances,
  attribute,
  fromLength,
  fromStartIndices,
  getData = x => x
}: {
  buffer: Buffer;
  numInstances: number;
  attribute: Attribute;
  fromLength: number;
  fromStartIndices?: NumericArray | null;
  getData?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
}): Buffer {
  // TODO: move the precisionMultiplier logic to the attribute when retrieving
  // its `size` and `elementOffset`?
  const precisionMultiplier =
    attribute.doublePrecision && attribute.value instanceof Float64Array ? 2 : 1;
  const size = attribute.size * precisionMultiplier;
  const byteOffset = attribute.byteOffset;
  const toStartIndices = attribute.startIndices;
  const hasStartIndices = fromStartIndices && toStartIndices;
  const toLength = getAttributeBufferLength(attribute, numInstances);
  const isConstant = attribute.isConstant;

  // check if buffer needs to be padded
  if (!hasStartIndices && fromLength >= toLength) {
    return buffer;
  }

  const toData = isConstant
    ? (attribute.value as TypedArray)
    : // TODO(v9.1): Avoid non-portable synchronous reads.
      toFloat32Array(attribute.getBuffer()!.readSyncWebGL());
  if (attribute.settings.normalized && !isConstant) {
    const getter = getData;
    getData = (value, chunk) => attribute.normalizeConstant(getter(value, chunk));
  }

  const getMissingData = isConstant
    ? (i, chunk) => getData(toData, chunk)
    : (i, chunk) => getData(toData.subarray(i + byteOffset, i + byteOffset + size), chunk);

  // TODO(v9.1): Avoid non-portable synchronous reads.
  const source = toFloat32Array(buffer.readSyncWebGL());
  const target = new Float32Array(toLength);
  padArray({
    source,
    target,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size,
    getData: getMissingData
  });

  if (buffer.byteLength < target.byteLength + byteOffset) {
    buffer = buffer.device.createBuffer({byteLength: target.byteLength + byteOffset});
  }
  buffer.write(target, byteOffset);
  return buffer;
}

function toFloat32Array(bytes: Uint8Array): Float32Array {
  return new Float32Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / Float32Array.BYTES_PER_ELEMENT
  );
}
