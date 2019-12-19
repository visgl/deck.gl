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
export function extractCameraVectors({viewMatrix, viewMatrixInverse}) {
  // Read the translation from the inverse view matrix
  return {
    eye: [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]],
    direction: [-viewMatrix[2], -viewMatrix[6], -viewMatrix[10]],
    up: [viewMatrix[1], viewMatrix[5], viewMatrix[9]],
    right: [viewMatrix[0], viewMatrix[4], viewMatrix[8]]
  };
}

const cameraPosition = new Vector3();
const cameraDirection = new Vector3();
const cameraUp = new Vector3();
const cameraRight = new Vector3();
const nearCenter = new Vector3();
const farCenter = new Vector3();
const a = new Vector3();

/* eslint-disable max-statements */

// Extract frustum planes in common space.
// Note that common space is left-handed
// (with y pointing down)
export function getFrustumPlanes({aspect, near, far, fovyRadians, position, direction, up, right}) {
  cameraDirection.copy(direction);

  // Account for any scaling of the z axis (e.g. in
  // mercator view matrix)
  const nearFarScale = 1 / cameraDirection.len();
  cameraDirection.normalize();

  cameraPosition.copy(position);

  cameraUp.copy(up);
  // Account for scaling of the xy axis
  const widthScale = 1 / cameraUp.len();
  cameraUp.normalize();
  cameraRight.copy(right).normalize();

  const nearHeight = 2 * Math.tan(fovyRadians / 2) * near * widthScale;
  const nearWidth = nearHeight * aspect;

  nearCenter
    .copy(cameraDirection)
    .scale(near * nearFarScale)
    .add(cameraPosition);
  farCenter
    .copy(cameraDirection)
    .scale(far * nearFarScale)
    .add(cameraPosition);

  let normal = cameraDirection.clone().negate();
  let distance = normal.dot(nearCenter);

  const planes = {
    near: {
      distance,
      normal
    },
    far: {
      distance: cameraDirection.dot(farCenter),
      normal: cameraDirection.clone()
    }
  };

  a.copy(cameraRight)
    .scale(nearWidth * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  normal = new Vector3(a).cross(cameraUp);
  distance = cameraPosition.dot(normal);
  planes.right = {normal, distance};

  a.copy(cameraRight)
    .scale(-nearWidth * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  normal = new Vector3(cameraUp).cross(a);
  distance = cameraPosition.dot(normal);
  planes.left = {normal, distance};

  a.copy(cameraUp)
    .scale(nearHeight * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  normal = new Vector3(cameraRight).cross(a);
  distance = cameraPosition.dot(normal);
  planes.top = {normal, distance};

  a.copy(cameraUp)
    .scale(-nearHeight * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  normal = new Vector3(a).cross(cameraRight);
  distance = cameraPosition.dot(normal);
  planes.bottom = {normal, distance};

  return planes;
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
