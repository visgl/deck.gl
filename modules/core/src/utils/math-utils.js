// Extensions to math.gl library. Intended to be folded back.

import {Vector3} from 'math.gl';

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

// Extract camera vectors (move to math library?)
export function extractCameraVectors({viewMatrix, viewMatrixInverse}) {
  // Read the translation from the inverse view matrix
  return {
    eye: [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]],
    direction: [viewMatrix[2], viewMatrix[6], viewMatrix[10]],
    up: [viewMatrix[1], viewMatrix[5], viewMatrix[9]]
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
export function getFrustumPlanes({aspect, near, far, fovyRadians, position, direction, up}) {
  cameraPosition.copy(position);
  cameraDirection.copy(direction).normalize();
  cameraUp.copy(up);

  cameraRight
    .copy(cameraDirection)
    .cross(cameraUp)
    .normalize();
  cameraUp.copy(cameraRight).cross(cameraDirection); // Orthogonalize

  const nearHeight = 2 * Math.tan(fovyRadians / 2) * near;
  const nearWidth = nearHeight * aspect;

  nearCenter
    .copy(cameraDirection)
    .scale(near)
    .add(cameraPosition);
  farCenter
    .copy(cameraDirection)
    .scale(far)
    .add(cameraPosition);

  const planes = {
    near: {
      d: cameraDirection.dot(nearCenter),
      n: cameraDirection.clone().negate()
    },
    far: {
      d: cameraDirection.dot(farCenter),
      n: cameraDirection.clone()
    }
  };

  a.copy(cameraRight)
    .scale(nearWidth * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  let n = new Vector3(a).cross(cameraUp);
  let d = cameraPosition.dot(n);
  planes.right = {n, d};

  a.copy(cameraRight)
    .scale(-nearWidth * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  n = new Vector3(cameraUp).cross(a);
  d = cameraPosition.dot(n);
  planes.left = {n, d};

  a.copy(cameraUp)
    .scale(nearHeight * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  n = new Vector3(cameraRight).cross(a);
  d = cameraPosition.dot(n);
  planes.top = {n, d};

  a.copy(cameraUp)
    .scale(-nearHeight * 0.5)
    .add(nearCenter)
    .subtract(cameraPosition)
    .normalize();
  n = new Vector3(a).cross(cameraRight);
  d = cameraPosition.dot(n);
  planes.bottom = {n, d};

  return planes;
}

/**
 * Calculate the low part of a WebGL 64 bit float
 * @param a {number} - the input float number
 * @returns {number} - the lower 32 bit of the number
 */
export function fp64LowPart(x) {
  return x - Math.fround(x);
}

// export function mod(value, divisor) {
//   assert(Number.isFinite(value) && Number.isFinite(divisor));
//   const modulus = value % divisor;
//   return modulus < 0 ? divisor + modulus : modulus;
// }
