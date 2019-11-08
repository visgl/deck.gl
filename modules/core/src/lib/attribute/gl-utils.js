import GL from '@luma.gl/constants';

/* eslint-disable complexity */
export function glArrayFromType(glType) {
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
