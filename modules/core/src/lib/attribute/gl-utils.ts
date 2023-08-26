import {GL} from '@luma.gl/constants';
import type {BufferAttributeLayout, VertexFormat} from '@luma.gl/core';
import type {TypedArrayConstructor} from '../../types/types';
import type {BufferAccessor} from './data-column';

/* eslint-disable complexity */
export function glArrayFromType(glType: number): TypedArrayConstructor {
  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (glType) {
    case GL.FLOAT:
      return Float32Array;
    case GL.DOUBLE:
      return Float64Array;
    case GL.UNSIGNED_SHORT:
    case GL.UNSIGNED_SHORT_5_6_5:
    case GL.UNSIGNED_SHORT_4_4_4_4:
    case GL.UNSIGNED_SHORT_5_5_5_1:
      return Uint16Array;
    case GL.UNSIGNED_INT:
      return Uint32Array;
    case GL.UNSIGNED_BYTE:
      return Uint8ClampedArray;
    case GL.BYTE:
      return Int8Array;
    case GL.SHORT:
      return Int16Array;
    case GL.INT:
      return Int32Array;
    default:
      throw new Error('Unknown GL type');
  }
}
/* eslint-enable complexity */

const glTypeToBufferFormat = {
  [GL.FLOAT]: 'float32',
  [GL.DOUBLE]: 'float32',
  [GL.UNSIGNED_SHORT]: 'uint16',
  [GL.UNSIGNED_SHORT_5_6_5]: 'uint16',
  [GL.UNSIGNED_SHORT_4_4_4_4]: 'uint16',
  [GL.UNSIGNED_SHORT_5_5_5_1]: 'uint16',
  [GL.UNSIGNED_INT]: 'uint32',
  [GL.UNSIGNED_BYTE]: 'uint8',
  [GL.BYTE]: 'sint8',
  [GL.SHORT]: 'sint16',
  [GL.INT]: 'sint32'
} as const;

export function getBufferAttributeLayout(name: string, accessor: BufferAccessor): BufferAttributeLayout {
  let type = glTypeToBufferFormat[accessor.type ?? GL.FLOAT];
  if (accessor.normalized) {
    type = type.replace('int', 'norm');
  }
  const result: BufferAttributeLayout = {
    attribute: name,
    format: accessor.size > 1 ? (`${type}x${accessor.size}` as VertexFormat) : type,
    byteOffset: accessor.offset || 0
    // Note stride is set on the top level
  };
  // if (accessor.stride) {
  //   result.byteStride = accessor.stride;
  // }
  // if (accessor.offset) {
  //   result.attributes[0].byteOffset = accessor.offset;
  // }
  return result;
}
