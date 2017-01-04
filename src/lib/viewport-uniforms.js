import {COORDINATE_SYSTEM} from 'viewport-mercator-project';
import {vec4} from 'gl-matrix';
import assert from 'assert';

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 *
 * TODO - Ensure this works with any viewport, not just WebMercatorViewports
 *
 * @param {WebMercatorViewport} viewport -
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export function getUniformsFromViewport(viewport, {
  modelMatrix = null,
  projectionMode = COORDINATE_SYSTEM.LNGLAT,
  positionOrigin = [0, 0]
} = {}) {
  // TODO: move the following line to initialization so that it's done only once
  const positionOriginPixels = viewport.projectFlat(positionOrigin);

  const projectedPositionOrigin = [positionOriginPixels[0], positionOriginPixels[1], 0.0, 1.0];

  // calculate WebGL matrices
  // TODO - could be cached for e.g. modelMatrix === null
  const matrices = viewport.getMatrices({modelMatrix});

  const {modelViewProjectionMatrix, scale, pixelsPerMeter} = matrices;
  assert(modelViewProjectionMatrix, 'Viewport missing modelViewProjectionMatrix');
  assert(scale, 'Viewport scale missing');
  assert(pixelsPerMeter, 'Viewport missing pixelsPerMeter');

  // Convert to Float32
  const glProjectionMatrix = new Float32Array(modelViewProjectionMatrix);

  // dy64ify
  const glProjectionMatrixFP64 = new Float32Array(32);
  // Transpose the projection matrix to column major for GLSL.
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      [
        glProjectionMatrixFP64[(i * 4 + j) * 2],
        glProjectionMatrixFP64[(i * 4 + j) * 2 + 1]
      ] = fp64ify(modelViewProjectionMatrix[j * 4 + i]);
    }
  }

  const projectionCenter =
    vec4.transformMat4([], projectedPositionOrigin, modelViewProjectionMatrix);

  return {
    // Projection mode values
    projectionMode,
    projectionCenter,

    // Main projection matrices
    projectionMatrix: glProjectionMatrix,
    projectionFP64: glProjectionMatrixFP64,
    projectionPixelsPerUnit: matrices.pixelsPerMeter,
    projectionScale: matrices.scale,
    projectionScaleFP64: fp64ify(matrices.scale)
  };
}
