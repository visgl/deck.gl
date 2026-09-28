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
 * Returns the number of components to upload per vertex on WebGPU.
 * WebGPU requires vertex strides to be a multiple of 4 bytes and has no 8/16-bit x3 formats,
 * so 8-bit attributes are widened to 4 components and 16-bit x1/x3 to 2/4 components.
 */
export function getWebGPUVertexSize(size: number, bytesPerElement: number): number {
  if (bytesPerElement >= 4 || size > 4) {
    return size;
  }
  return (Math.ceil((size * bytesPerElement) / 4) * 4) / bytesPerElement;
}

/** Value of a missing vertex component (0, 0, 0, 1), expressed in the units of `type` */
function getMissingComponentValue(type: DataType, index: number): number {
  if (index < 3) {
    return 0;
  }
  switch (type) {
    case 'uint8':
    case 'unorm8':
      // uint8 is uploaded as unorm8 on WebGPU
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
 * Repacks `value`, described by `accessor` (offset and stride in bytes), into a dense array
 * of `paddedSize` components per vertex. Added components are filled from `defaultValue`,
 * falling back to the (0, 0, 0, 1) missing component rule.
 */
export function padVertexValues(
  value: TypedArray,
  accessor: DataColumnSettings<unknown>,
  paddedSize: number
): TypedArray {
  const {size, type, defaultValue} = accessor;
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const offset = (accessor.offset || 0) / bytesPerElement;
  const stride = getStride(accessor) / bytesPerElement;
  const vertexCount =
    value.length < offset + size ? 0 : Math.floor((value.length - offset - size) / stride) + 1;

  const padValues: number[] = [];
  for (let component = size; component < paddedSize; component++) {
    padValues[component] = Number.isFinite(defaultValue[component])
      ? defaultValue[component]
      : getMissingComponentValue(type, component);
  }

  const ArrayType = value.constructor as TypedArrayConstructor;
  const result = new ArrayType(vertexCount * paddedSize);
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const sourceIndex = offset + vertex * stride;
    const targetIndex = vertex * paddedSize;
    for (let component = 0; component < paddedSize; component++) {
      result[targetIndex + component] =
        component < size ? value[sourceIndex + component] : padValues[component];
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
