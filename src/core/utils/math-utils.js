// Extensions to math.gl library. Intended to be folded back.

import vec4_multiply from 'gl-vec4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';
import assert from '../utils/assert';
import {Matrix4, radians} from 'math.gl';

export function transformVector(matrix, vector) {
  // Handle non-invertible matrix
  if (!matrix) {
    return null;
  }
  const result = vec4_transformMat4([0, 0, 0, 0], vector, matrix);
  const scale = 1 / result[3];
  vec4_multiply(result, result, [scale, scale, scale, scale]);
  return result;
}

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

export function mod(value, divisor) {
  assert(Number.isFinite(value) && Number.isFinite(divisor));
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

export function lerp(start, end, step) {
  if (Array.isArray(start)) {
    return start.map((element, index) => {
      return lerp(element, end[index], step);
    });
  }
  return step * end + (1 - step) * start;
}

// TODO - this method is being added to math.gl, remove when published
export function createOrthographicMatrix({fovY, aspect, focalDistance, near, far}) {
  const halfY = fovY / 2;
  const top = focalDistance * Math.tan(halfY); // focus_plane is the distance from the camera
  const right = top * aspect;

  return new Matrix4().ortho({
    left: -right,
    right,
    bottom: -top,
    top,
    near,
    far
  });
}

// TODO - this function is being added to viewport-mercator-project, remove when published
// PROJECTION MATRIX PARAMETERS
// This is a "Mapbox" projection matrix - matches mapbox exactly if farZMultiplier === 1
// Variable fov (in radians)
export function getProjectionParameters({
  width,
  height,
  altitude = 1.5,
  pitch = 0,
  farZMultiplier = 1
}) {
  // Find the distance from the center point to the center top
  // in altitude units using law of sines.
  const pitchRadians = radians(pitch);
  const halfFov = Math.atan(0.5 / altitude);
  const topHalfSurfaceDistance =
    Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);

  // Calculate z value of the farthest fragment that should be rendered.
  const farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;

  return {
    fov: 2 * Math.atan(height / 2 / altitude),
    aspect: width / height,
    focalDistance: altitude,
    near: 0.1,
    far: farZ * farZMultiplier
  };
}
