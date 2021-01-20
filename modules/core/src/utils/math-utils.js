// Extensions to math.gl library. Intended to be folded back.
import typedArrayManager from './typed-array-manager';
import {Vector3} from 'math.gl';

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function mod(value, divisor) {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

// Extract camera vectors (move to math library?)
export function getCameraPosition(viewMatrixInverse) {
  // Read the translation from the inverse view matrix
  return [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]];
}

// https://www.gamedevs.org/uploads/fast-extraction-viewing-frustum-planes-from-world-view-projection-matrix.pdf
export function getFrustumPlanes(viewProjectionMatrix) {
  const planes = {};

  planes.left = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[0],
    viewProjectionMatrix[7] + viewProjectionMatrix[4],
    viewProjectionMatrix[11] + viewProjectionMatrix[8],
    viewProjectionMatrix[15] + viewProjectionMatrix[12]
  );
  planes.right = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[0],
    viewProjectionMatrix[7] - viewProjectionMatrix[4],
    viewProjectionMatrix[11] - viewProjectionMatrix[8],
    viewProjectionMatrix[15] - viewProjectionMatrix[12]
  );
  planes.bottom = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[1],
    viewProjectionMatrix[7] + viewProjectionMatrix[5],
    viewProjectionMatrix[11] + viewProjectionMatrix[9],
    viewProjectionMatrix[15] + viewProjectionMatrix[13]
  );
  planes.top = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[1],
    viewProjectionMatrix[7] - viewProjectionMatrix[5],
    viewProjectionMatrix[11] - viewProjectionMatrix[9],
    viewProjectionMatrix[15] - viewProjectionMatrix[13]
  );
  planes.near = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[2],
    viewProjectionMatrix[7] + viewProjectionMatrix[6],
    viewProjectionMatrix[11] + viewProjectionMatrix[10],
    viewProjectionMatrix[15] + viewProjectionMatrix[14]
  );
  planes.far = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[2],
    viewProjectionMatrix[7] - viewProjectionMatrix[6],
    viewProjectionMatrix[11] - viewProjectionMatrix[10],
    viewProjectionMatrix[15] - viewProjectionMatrix[14]
  );

  return planes;
}

const scratchVector = new Vector3();

function getFrustumPlane(a, b, c, d) {
  scratchVector.set(a, b, c);
  const L = scratchVector.len();
  return {distance: d / L, normal: new Vector3(-a / L, -b / L, -c / L)};
}

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
