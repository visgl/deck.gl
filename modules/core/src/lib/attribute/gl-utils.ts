import {GL, GLDataType} from '@luma.gl/constants';
import type {BufferAttributeLayout, TypedArray, VertexFormat} from '@luma.gl/core';
import type {TypedArrayConstructor} from '../../types/types';
import type {BufferAccessor, DataColumnSettings} from './data-column';

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

export function getBufferAttributeLayout(
  name: string,
  accessor: BufferAccessor
): BufferAttributeLayout {
  let type = glTypeToBufferFormat[accessor.type ?? GL.FLOAT];
  if (accessor.normalized) {
    type = type.replace('int', 'norm');
  }
  return {
    attribute: name,
    format: (accessor.size as number) > 1 ? (`${type}x${accessor.size}` as VertexFormat) : type,
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
    (accessor1.type ?? GL.FLOAT) === (accessor2.type ?? GL.FLOAT) &&
    accessor1.size === accessor2.size &&
    getStride(accessor1) === getStride(accessor2) &&
    (accessor1.offset || 0) === (accessor2.offset || 0)
  );
}

const ERR_TYPE_DEDUCTION = 'Failed to deduce GL constant from typed array';

/**
 * Converts TYPED ARRAYS to corresponding GL constant
 * Used to auto deduce gl parameter types
 * @todo Duplicated from `@luma.gl/webgl`.
 */
export function getGLTypeFromTypedArray(arrayOrType: TypedArray): GLDataType {
  // If typed array, look up constructor
  const type = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;
  switch (type) {
    case Float32Array:
      return GL.FLOAT;
    case Uint16Array:
      return GL.UNSIGNED_SHORT;
    case Uint32Array:
      return GL.UNSIGNED_INT;
    case Uint8Array:
      return GL.UNSIGNED_BYTE;
    case Uint8ClampedArray:
      return GL.UNSIGNED_BYTE;
    case Int8Array:
      return GL.BYTE;
    case Int16Array:
      return GL.SHORT;
    case Int32Array:
      return GL.INT;
    default:
      throw new Error(ERR_TYPE_DEDUCTION);
  }
}
