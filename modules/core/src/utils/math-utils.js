// Extensions to math.gl library. Intended to be folded back.

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

// export function mod(value, divisor) {
//   assert(Number.isFinite(value) && Number.isFinite(divisor));
//   const modulus = value % divisor;
//   return modulus < 0 ? divisor + modulus : modulus;
// }

// Normalizes longitude (lng) with respect to reference longitude (refLng)
export function normalizeLongitude(lng, refLng) {
  const deltaLng = lng - refLng;
  if (deltaLng > 180) {
    return lng - 360;
  } else if (deltaLng < -180) {
    return lng + 360;
  }
  return lng;
}
