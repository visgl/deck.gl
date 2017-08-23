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
import mat4_multiply from 'gl-mat4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';

import log from '../../utils/log';
import assert from 'assert';
import {COORDINATE_SYSTEM} from '../../lib/constants';

import {projectFlat} from '../../viewport-mercator-project/web-mercator-utils';

// To quickly set a vector to zero
const ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// TODO - import these utils from fp64 package
function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - hiPart;
  return [hiPart, loPart];
}

// calculate WebGL 64 bit matrix (transposed "Float64Array")
function fp64ifyMatrix4(matrix) {
  // Transpose the projection matrix to column major for GLSL.
  const matrixFP64 = new Float32Array(32);
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      [
        matrixFP64[(i * 4 + j) * 2],
        matrixFP64[(i * 4 + j) * 2 + 1]
      ] = fp64ify(matrix[j * 4 + i]);
    }
  }
  return matrixFP64;
}

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

// Calculate transformed projectionCenter (using 64 bit precision JS)
// This is the key to offset mode precision
// (avoids doing this addition in 32 bit precision in GLSL)
function calculateProjectionCenter({coordinateOrigin, coordinateZoom, viewProjectionMatrix}) {
  const positionPixels = projectFlat(coordinateOrigin, Math.pow(2, coordinateZoom));
  // projectionCenter = new Matrix4(viewProjectionMatrix)
  //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
  return vec4_transformMat4([],
    [positionPixels[0], positionPixels[1], 0.0, 1.0],
    viewProjectionMatrix);
}

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
// Uncomment when debugging
function calculateMatrixAndOffset({
  // UNCHANGED
  viewport,
  modelMatrix,
  // NEW PARAMS
  coordinateSystem,
  coordinateOrigin,
  coordinateZoom,
  // DEPRECATED PARAMS
  projectionMode,
  positionOrigin = [0, 0]
}) {
  const {viewMatrixUncentered} = viewport;
  let {viewMatrix} = viewport;
  const {projectionMatrix} = viewport;
  let {viewProjectionMatrix} = viewport;

  let projectionCenter;

  switch (coordinateSystem) {

  case COORDINATE_SYSTEM.IDENTITY:
  case COORDINATE_SYSTEM.LNGLAT:
    projectionCenter = ZERO_VECTOR;
    break;

  // TODO: make lighitng work for meter offset mode
  case COORDINATE_SYSTEM.METER_OFFSETS:
    projectionCenter = calculateProjectionCenter({
      coordinateOrigin, coordinateZoom, viewProjectionMatrix
    });

    // Always apply uncentered projection matrix if available (shader adds center)
    viewMatrix = viewMatrixUncentered || viewMatrix;

    // Zero out 4th coordinate ("after" model matrix) - avoids further translations
    // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
    //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
    viewProjectionMatrix = mat4_multiply([], projectionMatrix, viewMatrix);

    viewProjectionMatrix = mat4_multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);

    break;

  default:
    throw new Error('Unknown projection mode');
  }

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
  assert(viewport);

  if (projectionMode !== undefined) {
    coordinateSystem = projectionMode;
    log.deprecated('projectionMode', 'coordinateSystem');
  }
  if (positionOrigin !== undefined) {
    coordinateOrigin = positionOrigin;
    log.deprecated('positionOrigin', 'coordinateOrigin');
  }

  coordinateZoom = coordinateZoom || viewport.zoom;
  assert(coordinateZoom >= 0);

  const {projectionCenter, viewProjectionMatrix, cameraPos} =
    calculateMatrixAndOffset({
      coordinateSystem, coordinateOrigin, coordinateZoom, modelMatrix, viewport
    });

  assert(viewProjectionMatrix, 'Viewport missing modelViewProjectionMatrix');

  // console.log(viewport, viewProjectionMatrix);

  // Calculate projection pixels per unit

  const distanceScales = viewport.getDistanceScales();

  const devicePixelRatio = (window && window.devicePixelRatio) || 1;

  return {
    // Projection mode values
    projectionMode,
    projectionCenter,

    // Screen size
    viewportSize: [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio],
    devicePixelRatio,

    projectionPixelsPerUnit: distanceScales.pixelsPerMeter,
    projectionScale: viewport.scale, // This is the mercator scale (2 ** zoom)

    // Projection matrices
    modelMatrix: new Float32Array(modelMatrix || IDENTITY_MATRIX),
    // viewMatrix: new Float32Array(viewMatrix),
    projectionMatrix: new Float32Array(viewProjectionMatrix),

    // 64 bit support
    projectionFP64: fp64ifyMatrix4(viewProjectionMatrix),
    projectionScaleFP64: fp64ify(viewport.scale), // Deprecated?

    // This is for lighting calculations
    cameraPos: new Float32Array(cameraPos)
  };
}
