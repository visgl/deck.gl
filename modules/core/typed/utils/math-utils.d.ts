import {Vector3, NumericArray} from '@math.gl/core';
import type {Matrix4} from '@math.gl/core';
export declare function createMat4(): number[];
export declare function mod(value: number, divisor: number): number;
export declare function getCameraPosition(
  viewMatrixInverse: Matrix4 | NumericArray
): [number, number, number];
export declare type FrustumPlane = {
  distance: number;
  normal: Vector3;
};
export declare function getFrustumPlanes(viewProjectionMatrix: Matrix4 | NumericArray): {
  left: FrustumPlane;
  right: FrustumPlane;
  top: FrustumPlane;
  bottom: FrustumPlane;
  near: FrustumPlane;
  far: FrustumPlane;
};
/**
 * Calculate the low part of a WebGL 64 bit float
 * @param x {number} - the input float number
 * @returns {number} - the lower 32 bit of the number
 */
export declare function fp64LowPart(x: number): number;
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
export declare function toDoublePrecisionArray(
  typedArray: Float64Array,
  options: {
    size?: number;
    startIndex?: number;
    endIndex?: number;
  }
): Float32Array;
// # sourceMappingURL=math-utils.d.ts.map
