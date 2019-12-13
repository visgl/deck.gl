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

import * as mat4 from 'gl-matrix/mat4';
import * as vec4 from 'gl-matrix/vec4';

import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../../lib/constants';

import memoize from '../../utils/memoize';
import assert from '../../utils/assert';

// To quickly set a vector to zero
const ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const DEFAULT_PIXELS_PER_UNIT2 = [0, 0, 0];
const DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];

// Based on viewport-mercator-project/test/fp32-limits.js
export const LNGLAT_AUTO_OFFSET_ZOOM_THRESHOLD = 12;

const getMemoizedViewportUniforms = memoize(calculateViewportUniforms);

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
// Uncomment when debugging
function calculateMatrixAndOffset({viewport, coordinateSystem, coordinateOrigin}) {
  const {viewMatrixUncentered, projectionMatrix, projectionMode} = viewport;
  let {viewMatrix, viewProjectionMatrix} = viewport;

  let projectionCenter = ZERO_VECTOR;
  let cameraPosCommon = viewport.cameraPosition;
  let shaderCoordinateOrigin = coordinateOrigin;
  let offsetMode = true;

  if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
    if (projectionMode === PROJECTION_MODE.WEB_MERCATOR) {
      offsetMode = false;
    } else {
      shaderCoordinateOrigin = [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0];
    }
  } else if (projectionMode === PROJECTION_MODE.IDENTITY) {
    shaderCoordinateOrigin = viewport.position.map(Math.fround);
  }

  shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;

  if (offsetMode) {
    // Calculate transformed projectionCenter (using 64 bit precision JS)
    // This is the key to offset mode precision
    // (avoids doing this addition in 32 bit precision in GLSL)
    const positionCommonSpace = viewport.projectPosition(shaderCoordinateOrigin);

    cameraPosCommon = [
      cameraPosCommon[0] - positionCommonSpace[0],
      cameraPosCommon[1] - positionCommonSpace[1],
      cameraPosCommon[2] - positionCommonSpace[2]
    ];

    positionCommonSpace[3] = 1;

    // projectionCenter = new Matrix4(viewProjectionMatrix)
    //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
    projectionCenter = vec4.transformMat4([], positionCommonSpace, viewProjectionMatrix);

    // Always apply uncentered projection matrix if available (shader adds center)
    viewMatrix = viewMatrixUncentered || viewMatrix;

    // Zero out 4th coordinate ("after" model matrix) - avoids further translations
    // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
    //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
    viewProjectionMatrix = mat4.multiply([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = mat4.multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix,
    viewProjectionMatrix,
    projectionCenter,
    cameraPosCommon,
    shaderCoordinateOrigin
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
  devicePixelRatio = 1,
  modelMatrix = null,
  // Match Layer.defaultProps
  coordinateSystem = COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
  wrapLongitude = false,
  // Deprecated
  projectionMode,
  positionOrigin
} = {}) {
  assert(viewport);

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial
      ? COORDINATE_SYSTEM.LNGLAT
      : COORDINATE_SYSTEM.CARTESIAN;
  }

  const uniforms = getMemoizedViewportUniforms({
    viewport,
    devicePixelRatio,
    coordinateSystem,
    coordinateOrigin
  });

  uniforms.project_uWrapLongitude = wrapLongitude;
  uniforms.project_uModelMatrix = modelMatrix || IDENTITY_MATRIX;

  return uniforms;
}

function calculateViewportUniforms({
  viewport,
  devicePixelRatio,
  coordinateSystem,
  coordinateOrigin
}) {
  const {
    projectionCenter,
    viewProjectionMatrix,
    cameraPosCommon,
    shaderCoordinateOrigin
  } = calculateMatrixAndOffset({
    coordinateSystem,
    coordinateOrigin,
    viewport
  });

  // Calculate projection pixels per unit
  const distanceScales = viewport.getDistanceScales();

  const viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];

  const uniforms = {
    // Projection mode values
    project_uCoordinateSystem: coordinateSystem,
    project_uProjectionMode: viewport.projectionMode,
    project_uCoordinateOrigin: shaderCoordinateOrigin,
    project_uCenter: projectionCenter,
    project_uAntimeridian: (viewport.longitude || 0) - 180,

    // Screen size
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,

    // Distance at which screen pixels are projected
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uCommonUnitsPerMeter: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    project_uScale: viewport.scale, // This is the mercator scale (2 ** zoom)

    project_uViewProjectionMatrix: viewProjectionMatrix,

    // This is for lighting calculations
    project_uCameraPosition: cameraPosCommon
  };

  const distanceScalesAtOrigin = viewport.getDistanceScales(shaderCoordinateOrigin);
  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.METER_OFFSETS:
      uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
      uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
      break;

    case COORDINATE_SYSTEM.LNGLAT:
    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
      uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
      break;

    default:
      break;
  }

  return uniforms;
}
