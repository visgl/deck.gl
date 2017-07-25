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

import assert from 'assert';
import {COORDINATE_SYSTEM} from '../../lib/constants';

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
  projectionMode,
  positionOrigin,
  viewport
}) {
  const {viewMatrixUncentered, projectionMatrix} = viewport;
  let {viewMatrix, viewProjectionMatrix} = viewport;
  let projectionCenter;

  switch (projectionMode) {

  case COORDINATE_SYSTEM.IDENTITY:
  case COORDINATE_SYSTEM.LNGLAT:
    projectionCenter = ZERO_VECTOR;
    break;

  // TODO: make lighitng work for meter offset mode
  case COORDINATE_SYSTEM.METER_OFFSETS:
    // Calculate transformed projectionCenter (in 64 bit precision)
    // This is the key to offset mode precision (avoids doing this
    // addition in 32 bit precision)
    const positionPixels = viewport.projectFlat(positionOrigin);
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

  return {
    viewMatrix,
    viewProjectionMatrix,
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
export function getUniformsFromViewport({
  viewport,
  modelMatrix = null,
  projectionMode = COORDINATE_SYSTEM.LNGLAT,
  positionOrigin = [0, 0]
} = {}) {
  if (!viewport) {
    return {};
  }

  assert(viewport.scale, 'Viewport scale missing');

  const {projectionCenter, viewProjectionMatrix, cameraPos} =
    calculateMatrixAndOffset({projectionMode, positionOrigin, viewport});

  // Calculate projection pixels per unit
  const {pixelsPerMeter} = viewport.getDistanceScales();
  assert(pixelsPerMeter, 'Viewport missing pixelsPerMeter');

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
    projectionScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    projectionScaleFP64: fp64ify(viewport.scale), // Deprecated?

    // This is for lighting calculations
    cameraPos: new Float32Array(cameraPos)
  };
}
