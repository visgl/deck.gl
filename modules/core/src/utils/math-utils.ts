// Extensions to math.gl library. Intended to be folded back.
import typedArrayManager from './typed-array-manager';
import {Vector3, NumericArray} from '@math.gl/core';

import type {Matrix4} from '@math.gl/core';

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4(): number[] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function mod(value: number, divisor: number): number {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

// Extract camera vectors (move to math library?)
export function getCameraPosition(
  viewMatrixInverse: Matrix4 | NumericArray
): [number, number, number] {
  // Read the translation from the inverse view matrix
  return [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]];
}

export type FrustumPlane = {
  distance: number;
  normal: Vector3;
};

// https://www.gamedevs.org/uploads/fast-extraction-viewing-frustum-planes-from-world-view-projection-matrix.pdf
export function getFrustumPlanes(viewProjectionMatrix: Matrix4 | NumericArray): {
  left: FrustumPlane;
  right: FrustumPlane;
  top: FrustumPlane;
  bottom: FrustumPlane;
  near: FrustumPlane;
  far: FrustumPlane;
} {
  return {
    left: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[0],
      viewProjectionMatrix[7] + viewProjectionMatrix[4],
      viewProjectionMatrix[11] + viewProjectionMatrix[8],
      viewProjectionMatrix[15] + viewProjectionMatrix[12]
    ),
    right: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[0],
      viewProjectionMatrix[7] - viewProjectionMatrix[4],
      viewProjectionMatrix[11] - viewProjectionMatrix[8],
      viewProjectionMatrix[15] - viewProjectionMatrix[12]
    ),
    bottom: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[1],
      viewProjectionMatrix[7] + viewProjectionMatrix[5],
      viewProjectionMatrix[11] + viewProjectionMatrix[9],
      viewProjectionMatrix[15] + viewProjectionMatrix[13]
    ),
    top: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[1],
      viewProjectionMatrix[7] - viewProjectionMatrix[5],
      viewProjectionMatrix[11] - viewProjectionMatrix[9],
      viewProjectionMatrix[15] - viewProjectionMatrix[13]
    ),
    near: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[2],
      viewProjectionMatrix[7] + viewProjectionMatrix[6],
      viewProjectionMatrix[11] + viewProjectionMatrix[10],
      viewProjectionMatrix[15] + viewProjectionMatrix[14]
    ),
    far: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[2],
      viewProjectionMatrix[7] - viewProjectionMatrix[6],
      viewProjectionMatrix[11] - viewProjectionMatrix[10],
      viewProjectionMatrix[15] - viewProjectionMatrix[14]
    )
  };
}

const scratchVector = new Vector3();

function getFrustumPlane(a: number, b: number, c: number, d: number): FrustumPlane {
  scratchVector.set(a, b, c);
  const L = scratchVector.len();
  return {distance: d / L, normal: new Vector3(-a / L, -b / L, -c / L)};
}

/**
 * Calculate the low part of a WebGL 64 bit float
 * @param x {number} - the input float number
 * @returns {number} - the lower 32 bit of the number
 */
export function fp64LowPart(x: number): number {
  return x - Math.fround(x);
}

let scratchArray;

/**
 * Split a Float64Array into a double-length Float32Array
 * @param typedArray
 * @param options
 * @param options.size  - per attribute size
 * @param options.startIndex - start index in the source array
 * @param options.endIndex  - end index in the source array
 * @returns {} - high part, low part for each attribute:
    [1xHi, 1yHi, 1zHi, 1xLow, 1yLow, 1zLow, 2xHi, ...]
 */
export function toDoublePrecisionArray(
  typedArray: Float64Array,
  options: {size?: number; startIndex?: number; endIndex?: number}
): Float32Array {
  const {size = 1, startIndex = 0} = options;

  const endIndex = options.endIndex !== undefined ? options.endIndex : typedArray.length;

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

type LayerBounds = [number[], number[]];
export function mergeBounds(boundsList: (LayerBounds | null)[]): LayerBounds | null {
  let mergedBounds: LayerBounds | null = null;
  let isMerged = false;

  for (const bounds of boundsList) {
    if (!bounds) continue;
    if (!mergedBounds) {
      mergedBounds = bounds;
    } else {
      if (!isMerged) {
        // Copy to avoid mutating input bounds
        mergedBounds = [
          [mergedBounds[0][0], mergedBounds[0][1]],
          [mergedBounds[1][0], mergedBounds[1][1]]
        ];
        isMerged = true;
      }

      mergedBounds[0][0] = Math.min(mergedBounds[0][0], bounds[0][0]);
      mergedBounds[0][1] = Math.min(mergedBounds[0][1], bounds[0][1]);
      mergedBounds[1][0] = Math.max(mergedBounds[1][0], bounds[1][0]);
      mergedBounds[1][1] = Math.max(mergedBounds[1][1], bounds[1][1]);
    }
  }

  return mergedBounds;
}
