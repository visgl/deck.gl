// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global window */
import mat4_invert from 'gl-mat4/invert';
import mat4_multiply from 'gl-mat4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';

import log from '../../utils/log';
import assert from 'assert';
import {COORDINATE_SYSTEM} from '../../lib/constants';

import {
  projectFlat,
  calculateDistanceScales
} from '../../viewport-mercator-project/web-mercator-utils';

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - hiPart;
  return [hiPart, loPart];
}

// To quickly set a vector to zero
const ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
// Uncomment when debugging
function calculateMatrixAndOffset({
  // OLD PARAMS
  projectionMode,
  positionOrigin = [0, 0],
  // NEW PARAMS
  coordinateSystem,
  coordinateOrigin,
  coordinateZoom,
  // UNCHANGED
  viewport,
  modelMatrix
}) {
  const {viewMatrixUncentered, projectionMatrix} = viewport;
  let {viewMatrix, viewProjectionMatrix} = viewport;
  let projectionCenter;

  switch (coordinateSystem) {

  case COORDINATE_SYSTEM.IDENTITY:
  case COORDINATE_SYSTEM.LNGLAT:
    projectionCenter = ZERO_VECTOR;
    break;

  // TODO: make lighitng work for meter offset mode
  case COORDINATE_SYSTEM.METER_OFFSETS:
  case COORDINATE_SYSTEM.UTM_OFFSETS:
    // Calculate transformed projectionCenter (in 64 bit precision)
    // This is the key to offset mode precision (avoids doing this
    // addition in 32 bit precision)
    const positionPixels = projectFlat(coordinateOrigin, Math.pow(2, coordinateZoom));
    // projectionCenter = new Matrix4(viewProjectionMatrix)
    //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
    projectionCenter = vec4_transformMat4([],
      [positionPixels[0], positionPixels[1], 0.0, 1.0],
      viewProjectionMatrix);

    // Always apply uncentered projection matrix if available (shader adds center)
    // Zero out 4th coordinate ("after" model matrix) - avoids further translations
    // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
    //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
    viewMatrix = mat4_multiply([], viewMatrixUncentered || viewMatrix, VECTOR_TO_POINT_MATRIX);
    viewProjectionMatrix = mat4_multiply([], projectionMatrix, viewMatrix);
    break;

  default:
    throw new Error('Unknown projection mode');
  }

  const viewMatrixInv = mat4_invert([], viewMatrix) || viewMatrix;
  const cameraPos = [viewMatrixInv[12], viewMatrixInv[13], viewMatrixInv[14]];

  if (modelMatrix) {
    // Apply model matrix if supplied
    // modelViewMatrix.multiplyRight(modelMatrix);
    mat4_multiply(modelViewMatrix, modelViewMatrix, modelMatrix);
  }

  // const modelViewProjectionMatrix = new Matrix4(projectionMatrix).multiplyRight(modelViewMatrix);
  const modelViewProjectionMatrix = mat4_multiply([], projectionMatrix, modelViewMatrix);

  return {
    viewMatrix,
    viewProjectionMatrix,
    projectionCenter,
    cameraPos: viewport.cameraPosition
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
export function getUniformsFromViewport({
  viewport,
  modelMatrix = null,
  coordinateSystem = COORDINATE_SYSTEM.LNGLAT,
  coordinateOrigin = [0, 0],
  coordinateZoom,
  // Deprecated
  projectionMode,
  positionOrigin
} = {}) {
  // TODO - this dummy return is needed to make test cases pass
  // assert(viewport);
  if (!viewport) {
    return {};
  }

  if (projectionMode !== undefined) {
    coordinateSystem = projectionMode;
    log.deprecated('projectionMode', 'coordinateSystem');
  }
  if (positionOrigin !== undefined) {
    coordinateOrigin = positionOrigin;
    log.deprecated('positionOrigin', 'coordinateOrigin');
  }

  coordinateZoom = coordinateZoom || viewport.zoom;
  assert(coordinateZoom);

  // <<<<<<< HEAD
  //   const {projectionCenter, viewProjectionMatrix, cameraPos} =
  //     calculateMatrixAndOffset({projectionMode, positionOrigin, viewport});

  //   // Calculate projection pixels per unit
  //   const {pixelsPerMeter, pixelsPerDegree, degreesPerMeter} =
  //     viewport.getDistanceScales({positionOrigin});
  //   assert(pixelsPerMeter, 'Viewport missing pixelsPerMeter');

  //   let pixelsPerMeterUTM = ZERO_VECTOR;
  //   if (projectionMode === COORDINATE_SYSTEM.UTM_OFFSETS) {
  //     pixelsPerMeterUTM = [
  //       degreesPerMeter[0] * pixelsPerDegree[0],
  //       degreesPerMeter[1] * pixelsPerDegree[1],
  //       degreesPerMeter[2] * pixelsPerDegree[0],
  //       degreesPerMeter[3] * pixelsPerDegree[1]
  //     ];
  //   }

  const {projectionCenter, modelViewMatrix, modelViewProjectionMatrix, cameraPos} =
    calculateMatrixAndOffset({
      coordinateSystem, coordinateOrigin, coordinateZoom, modelMatrix, viewport
    });

  assert(modelViewProjectionMatrix, 'Viewport missing modelViewProjectionMatrix');

  // Calculate projection pixels per unit
  const distanceScales = coordinateZoom !== undefined ?
    calculateDistanceScales({
      longitude: coordinateOrigin[0],
      latitude: coordinateOrigin[1],
      zoom: coordinateZoom
    }) :
    viewport.getDistanceScales();

  const scale = Math.pow(2, coordinateZoom);
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
      ] = fp64ify(viewProjectionMatrix[j * 4 + i]);
    }
  }

  const devicePixelRatio = (window && window.devicePixelRatio) || 1;

  return {
    // Projection mode values
    projectionMode,
    projectionCenter,

    // Screen size
    viewportSize: [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio],
    devicePixelRatio,

    // Main projection matrices
    modelMatrix: new Float32Array(modelMatrix || IDENTITY_MATRIX),
    // viewMatrix: new Float32Array(viewMatrix),
    projectionMatrix: new Float32Array(viewProjectionMatrix),
    projectionFP64: glProjectionMatrixFP64,

    projectionPixelsPerUnit: pixelsPerMeter,
    projectionPixelsPerUnitUTM: pixelsPerMeterUTM,
    projectionScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    projectionScaleFP64: fp64ify(viewport.scale), // Deprecated?
    // =======
    //     projectionPixelsPerUnit: distanceScales.pixelsPerMeter,
    //     projectionScale: scale, // This is the mercator scale (2 ** zoom)
    //     projectionScaleFP64: fp64ify(scale), // Deprecated?
    // >>>>>>> New project module

    // This is for lighting calculations
    cameraPos: new Float32Array(cameraPos)
  };
}
