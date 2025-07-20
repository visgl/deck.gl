// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getTypedArrayConstructor, getDataType} from '@luma.gl/core';
import type {BufferAttributeLayout, VertexFormat} from '@luma.gl/core';
import type {TypedArrayConstructor} from '../../types/types';
import type {BufferAccessor, DataColumnSettings, LogicalDataType} from './data-column';

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

export const dataTypeFromTypedArray = getDataType;

export function getBufferAttributeLayout(
  name: string,
  accessor: BufferAccessor,
  deviceType: 'webgpu' | 'wegbgl' | string
): BufferAttributeLayout {
  // TODO(ibgreen): WebGPU change. Currently we always use normalized 8 bit integers
  const type = deviceType === 'webgpu' && accessor.type === 'uint8' ? 'unorm8' : accessor.type;
  return {
    attribute: name,
    // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
    format:
      (accessor.size as number) > 1 ? (`${type}x${accessor.size}` as VertexFormat) : accessor.type,
    byteOffset: accessor.offset || 0
    // Note stride is set on the top level
  };
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
