import {Matrix4} from 'luma.gl';

import assert from 'assert';
import {COORDINATE_SYSTEM} from './constants';

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

// To quickly set a vector to zero
const ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

function calculateMatrixAndOffset({
  projectionMode,
  positionOrigin,
  viewport,
  modelMatrix
}) {
  const {viewMatrixUncentered, viewMatrix, projectionMatrix} = viewport;

  let projectionCenter;
  let modelViewProjectionMatrix;

  const modelViewMatrixInv = new Matrix4(viewMatrix);
  const viewProjectionMatrix = new Matrix4(projectionMatrix).multiplyRight(viewMatrix);

  switch (projectionMode) {

  case COORDINATE_SYSTEM.LNGLAT:
    projectionCenter = ZERO_VECTOR;
    modelViewProjectionMatrix = viewProjectionMatrix;
    if (modelMatrix) {
      // Apply model matrix if supplied
      // modelViewProjectionMatrix = modelViewProjectionMatrix.clone();
      modelViewProjectionMatrix.multiplyRight(modelMatrix);
      modelViewMatrixInv.multiplyRight(modelMatrix);
    }
    modelViewMatrixInv.invert();
    break;

  // TODO: make lighitng work for meter offset mode
  case COORDINATE_SYSTEM.METER_OFFSETS:
    // Calculate transformed projectionCenter (in 64 bit precision)
    // This is the key to offset mode precision (avoids doing this
    // addition in 32 bit precision)
    const positionPixels = viewport.projectFlat(positionOrigin);
    projectionCenter = viewProjectionMatrix
      .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);

    modelViewProjectionMatrix = new Matrix4(projectionMatrix)
      // Always apply uncentered projection matrix (shader adds center)
      .multiplyRight(viewMatrixUncentered)
      // Zero out 4th coordinate ("after" model matrix) - avoids further translations
      .multiplyRight(VECTOR_TO_POINT_MATRIX);

    if (modelMatrix) {
      // Apply model matrix if supplied
      modelViewProjectionMatrix.multiplyRight(modelMatrix);
    }
    break;

  default:
    throw new Error('Unknown projection mode');
  }

  const cameraPos = [modelViewMatrixInv[12], modelViewMatrixInv[13], modelViewMatrixInv[14]];

  return {
    modelViewProjectionMatrix,
    projectionCenter,
    cameraPos
  };
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
  assert(viewport.scale, 'Viewport scale missing');

  const {projectionCenter, modelViewProjectionMatrix, cameraPos} =
    calculateMatrixAndOffset({projectionMode, positionOrigin, modelMatrix, viewport});

  assert(modelViewProjectionMatrix, 'Viewport missing modelViewProjectionMatrix');

  // Calculate projection pixels per unit
  const projectionPixelsPerUnit = viewport.getDistanceScales().pixelsPerMeter;
  assert(projectionPixelsPerUnit, 'Viewport missing pixelsPerMeter');

  // calculate WebGL matrices

  // Convert to Float32
  const glProjectionMatrix = new Float32Array(modelViewProjectionMatrix);

  // "Float64Array"
  // Transpose the projection matrix to column major for GLSL.
  const glProjectionMatrixFP64 = new Float32Array(32);
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      [
        glProjectionMatrixFP64[(i * 4 + j) * 2],
        glProjectionMatrixFP64[(i * 4 + j) * 2 + 1]
      ] = fp64ify(modelViewProjectionMatrix[j * 4 + i]);
    }
  }

  return {
    // Projection mode values
    projectionMode,
    projectionCenter,

    // modelMatrix: modelMatrix || new Matrix4().identity(),

    // Main projection matrices
    projectionMatrix: glProjectionMatrix,
    projectionMatrixUncentered: glProjectionMatrix,
    projectionFP64: glProjectionMatrixFP64,
    projectionPixelsPerUnit,

    // This is the mercator scale (2 ** zoom)
    projectionScale: viewport.scale,

    // Deprecated?
    projectionScaleFP64: fp64ify(viewport.scale),

    // This is for lighting calculations
    cameraPos: new Float32Array(cameraPos)

  };
}
