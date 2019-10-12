import typedArrayManager from './typed-array-manager';

/**
 * Calculate the low part of a WebGL 64 bit float
 * @param x {number} - the input float number
 * @returns {number} - the lower 32 bit of the number
 */
export function fp64LowPart(x) {
  return x - Math.fround(x);
}

let scratchArray;

/**
 * Split a Float64Array into a double-length Float32Array
 * @param typedArray {Float64Array}
 * @param size {Number} - per attribute size
 * @param [startIndex] {Number} - start index in the source array
 * @param [endIndex] {Number} - end index in the source array
 * @returns {Float32Array} - high part, low part for each attribute:
    [1xHi, 1yHi, 1zHi, 1xLow, 1yLow, 1zLow, 2xHi, ...]
 */
export function toDoublePrecisionArray(typedArray, {size = 1, startIndex = 0, endIndex}) {
  if (!Number.isFinite(endIndex)) {
    endIndex = typedArray.length;
  }
  const count = (endIndex - startIndex) / size;
  scratchArray = typedArrayManager.allocate(scratchArray, count, {
    type: Float32Array,
    size: size * 2
  });

  let sourceIndex = startIndex;
  let targetIndex = 0;
  while (sourceIndex < endIndex) {
    for (let j = 0; j < size; j++) {
      const value = typedArray[sourceIndex++];
      scratchArray[targetIndex + j] = value;
      scratchArray[targetIndex + j + size] = fp64LowPart(value);
    }
    targetIndex += size * 2;
  }

  return scratchArray.subarray(0, count * size * 2);
}
