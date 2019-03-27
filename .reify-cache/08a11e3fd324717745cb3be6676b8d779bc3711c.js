"use strict";module.export({transformVector:()=>transformVector,createMat4:()=>createMat4,extractCameraVectors:()=>extractCameraVectors,mod:()=>mod});var vec4;module.link('gl-matrix/vec4',{"*"(v){vec4=v}},0);var assert;module.link('../utils/assert',{default(v){assert=v}},1);// Extensions to math.gl library. Intended to be folded back.




function transformVector(matrix, vector) {
  // Handle non-invertible matrix
  if (!matrix) {
    return null;
  }
  const result = vec4.transformMat4([0, 0, 0, 0], vector, matrix);
  const scale = 1 / result[3];
  vec4.multiply(result, result, [scale, scale, scale, scale]);
  return result;
}

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

// Extract camera vectors (move to math library?)
function extractCameraVectors({viewMatrix, viewMatrixInverse}) {
  // Read the translation from the inverse view matrix
  return {
    eye: [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]],
    direction: [viewMatrix[2], viewMatrix[6], viewMatrix[10]],
    up: [viewMatrix[1], viewMatrix[5], viewMatrix[9]]
  };
}

function mod(value, divisor) {
  assert(Number.isFinite(value) && Number.isFinite(divisor));
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}
