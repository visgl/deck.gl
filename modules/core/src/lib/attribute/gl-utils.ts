// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {dataTypeDecoder, getTypedArrayConstructor} from '@luma.gl/core';
import type {BufferAttributeLayout, VertexFormat} from '@luma.gl/core';
import type {TypedArray, TypedArrayConstructor} from '../../types/types';
import type {BufferAccessor, DataColumnSettings, DataType, LogicalDataType} from './data-column';

export function typedArrayFromDataType(type: LogicalDataType): TypedArrayConstructor {
  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (type) {
    case 'float64':
      return Float64Array;
    case 'uint8':
    case 'unorm8':
      return Uint8ClampedArray;
    default:
      return getTypedArrayConstructor(type);
  }
}

export const dataTypeFromTypedArray = dataTypeDecoder.getDataType.bind(dataTypeDecoder);

/** Returns the byte length of one element of `type` in a vertex buffer */
export function getDataTypeByteLength(type: DataType): number {
  return dataTypeDecoder.getDataTypeInfo(type).byteLength;
}

export function getBufferAttributeLayout(
  name: string,
  accessor: BufferAccessor,
  deviceType: 'webgpu' | 'webgl' | string
): BufferAttributeLayout | null {
  if ((accessor.size as number) > 4) {
    // Definitely not valid. TODO - stricter validation?
    return null;
  }
  // TODO(ibgreen): WebGPU change. Currently we always use normalized 8 bit integers
  const type = deviceType === 'webgpu' && accessor.type === 'uint8' ? 'unorm8' : accessor.type;
  const size = accessor.size as number;
  const webglOnly = Boolean(
    deviceType !== 'webgpu' &&
      size === 3 &&
      type &&
      ['uint8', 'sint8', 'unorm8', 'snorm8', 'uint16', 'sint16', 'unorm16', 'snorm16'].includes(
        type
      )
  );
  return {
    attribute: name,
    // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
    format:
      size > 1 ? (`${type}x${size}${webglOnly ? '-webgl' : ''}` as VertexFormat) : accessor.type,
    byteOffset: accessor.offset || 0
    // Note stride is set on the top level
  };
}

/**
 * Returns the vertex layout of `accessor` as uploaded to a WebGPU buffer.
 * WebGPU has no 8/16-bit x3 formats, so these are widened to x4. Other sizes keep their format.
 * Rows are densely packed with a stride rounded up to a multiple of 4 bytes, as WebGPU requires.
 */
export function getWebGPUPaddedAccessor<T extends DataColumnSettings<unknown>>(accessor: T): T {
  const bytesPerElement = getDataTypeByteLength(accessor.type);
  const size = accessor.size === 3 ? 4 : accessor.size;
  const stride = Math.ceil((size * bytesPerElement) / 4) * 4;
  return {...accessor, size, stride, offset: 0};
}

/**
 * Value of a missing fourth vertex component, in the units of `type`. Like WebGL, which fills
 * missing components with (0, 0, 0, 1), this is 1.0 for normalized types and 1 otherwise.
 */
function getMissingWValue(type: DataType): number {
  switch (type) {
    // uint8 is uploaded as unorm8 when widened, see getBufferAttributeLayout
    case 'uint8':
    case 'unorm8':
      return 255;
    case 'snorm8':
      return 127;
    case 'unorm16':
      return 65535;
    case 'snorm16':
      return 32767;
    default:
      return 1;
  }
}

/**
 * Repacks `value`, described by `accessor` (offset and stride in bytes), into the dense rows of
 * `uploadAccessor`. A widened fourth component is filled like WebGL's missing components, and
 * any remaining bytes of a row are zero.
 */
export function padVertexValues(
  value: TypedArray,
  accessor: DataColumnSettings<unknown>,
  uploadAccessor: DataColumnSettings<unknown>
): TypedArray {
  const {size, type} = accessor;
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const offset = (accessor.offset || 0) / bytesPerElement;
  const stride = getStride(accessor) / bytesPerElement;
  const uploadStride = getStride(uploadAccessor) / bytesPerElement;
  const vertexCount =
    value.length < offset + size ? 0 : Math.floor((value.length - offset - size) / stride) + 1;
  const missingW = uploadAccessor.size > size ? getMissingWValue(type) : 0;

  const ArrayType = value.constructor as TypedArrayConstructor;
  const result = new ArrayType(vertexCount * uploadStride);
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const sourceIndex = offset + vertex * stride;
    const targetIndex = vertex * uploadStride;
    for (let component = 0; component < size; component++) {
      result[targetIndex + component] = value[sourceIndex + component];
    }
    if (missingW) {
      result[targetIndex + 3] = missingW;
    }
  }
  return result;
}

export function getStride(accessor: DataColumnSettings<unknown>): number {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}

export function bufferLayoutEqual(
  accessor1: DataColumnSettings<unknown>,
  accessor2: DataColumnSettings<unknown>
) {
  return (
    accessor1.type === accessor2.type &&
    accessor1.size === accessor2.size &&
    getStride(accessor1) === getStride(accessor2) &&
    (accessor1.offset || 0) === (accessor2.offset || 0)
  );
}
