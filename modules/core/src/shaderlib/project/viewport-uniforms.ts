// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable complexity, camelcase */

import {mat4, Matrix4Like, vec4} from '@math.gl/core';

import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../../lib/constants';

import memoize from '../../utils/memoize';

import type Viewport from '../../viewports/viewport';
import type {CoordinateSystem} from '../../lib/constants';

type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

// To quickly set a vector to zero
const ZERO_VECTOR: Vec4 = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX: Matrix4Like = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX: Matrix4Like = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const DEFAULT_PIXELS_PER_UNIT2: Vec3 = [0, 0, 0];
const DEFAULT_COORDINATE_ORIGIN: Vec3 = [0, 0, 0];

const getMemoizedViewportUniforms = memoize(calculateViewportUniforms);

export function getOffsetOrigin(
  viewport: Viewport,
  coordinateSystem: CoordinateSystem,
  coordinateOrigin: Vec3 = DEFAULT_COORDINATE_ORIGIN
): {
  geospatialOrigin: Vec3 | null;
  shaderCoordinateOrigin: Vec3;
  offsetMode: boolean;
} {
  if (coordinateOrigin.length < 3) {
    coordinateOrigin = [coordinateOrigin[0], coordinateOrigin[1], 0];
  }

  let shaderCoordinateOrigin = coordinateOrigin;
  let geospatialOrigin: Vec3 | null;
  let offsetMode = true;

  if (
    coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS ||
    coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS
  ) {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial
      ? // @ts-expect-error longitude and latitude are not defined on the base Viewport, but is expected on geospatial viewports
        [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0]
      : null;
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (
        coordinateSystem === COORDINATE_SYSTEM.LNGLAT ||
        coordinateSystem === COORDINATE_SYSTEM.CARTESIAN
      ) {
        geospatialOrigin = [0, 0, 0];
        offsetMode = false;
      }
      break;

    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        // viewport center in world space
        // @ts-expect-error when using LNGLAT coordinates, we expect the viewport to be geospatial, in which case geospatialOrigin is defined
        shaderCoordinateOrigin = geospatialOrigin;
      } else if (coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        // viewport center in common space
        shaderCoordinateOrigin = [
          Math.fround(viewport.center[0]),
          Math.fround(viewport.center[1]),
          0
        ];
        // Geospatial origin (wgs84) must match shaderCoordinateOrigin (common)
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }
      break;

    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround) as Vec3;
      shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
      break;

    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;

    default:
      // Unknown projection mode
      offsetMode = false;
  }

  return {geospatialOrigin, shaderCoordinateOrigin, offsetMode};
}

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
function calculateMatrixAndOffset(
  viewport: Viewport,
  coordinateSystem: CoordinateSystem,
  coordinateOrigin: Vec3
): {
  viewMatrix: Matrix4Like;
  viewProjectionMatrix: Matrix4Like;
  projectionCenter: Vec4;
  originCommon: Vec4;
  cameraPosCommon: Vec3;
  shaderCoordinateOrigin: Vec3;
  geospatialOrigin: Vec3 | null;
} {
  const {viewMatrixUncentered, projectionMatrix} = viewport;
  let {viewMatrix, viewProjectionMatrix} = viewport;

  let projectionCenter = ZERO_VECTOR;
  let originCommon: Vec4 = ZERO_VECTOR;
  let cameraPosCommon: Vec3 = viewport.cameraPosition as Vec3;
  const {geospatialOrigin, shaderCoordinateOrigin, offsetMode} = getOffsetOrigin(
    viewport,
    coordinateSystem,
    coordinateOrigin
  );

  if (offsetMode) {
    // Calculate transformed projectionCenter (using 64 bit precision JS)
    // This is the key to offset mode precision
    // (avoids doing this addition in 32 bit precision in GLSL)
    // @ts-expect-error the 4th component is assigned below
    originCommon = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);

    cameraPosCommon = [
      cameraPosCommon[0] - originCommon[0],
      cameraPosCommon[1] - originCommon[1],
      cameraPosCommon[2] - originCommon[2]
    ];

    originCommon[3] = 1;

    // projectionCenter = new Matrix4(viewProjectionMatrix)
    //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
    projectionCenter = vec4.transformMat4([], originCommon, viewProjectionMatrix);

    // Always apply uncentered projection matrix if available (shader adds center)
    viewMatrix = viewMatrixUncentered || viewMatrix;

    // Zero out 4th coordinate ("after" model matrix) - avoids further translations
    // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
    //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
    viewProjectionMatrix = mat4.multiply([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = mat4.multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix: viewMatrix as Matrix4Like,
    viewProjectionMatrix: viewProjectionMatrix as Matrix4Like,
    projectionCenter,
    originCommon,
    cameraPosCommon,
    shaderCoordinateOrigin,
    geospatialOrigin
  };
}

export type ProjectUniforms = {
  coordinateSystem: number;
  projectionMode: number;
  coordinateOrigin: Vec3;
  commonOrigin: Vec3;
  center: Vec4;
  // Backward compatibility
  // TODO: remove in v9
  pseudoMeters: boolean;

  // Screen size
  viewportSize: [number, number];
  devicePixelRatio: number;

  focalDistance: number;
  commonUnitsPerMeter: Vec3;
  commonUnitsPerWorldUnit: Vec3;
  commonUnitsPerWorldUnit2: Vec3;
  /** 2^zoom */
  scale: number;
  wrapLongitude: boolean;

  viewProjectionMatrix: Matrix4Like;
  modelMatrix: Matrix4Like;

  // This is for lighting calculations
  cameraPosition: Vec3;
};

export type ProjectProps = {
  viewport: Viewport;
  devicePixelRatio?: number;
  modelMatrix?: Matrix4Like | null;
  coordinateSystem?: CoordinateSystem;
  coordinateOrigin?: Vec3;
  autoWrapLongitude?: boolean;
};

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
  autoWrapLongitude = false
}: ProjectProps): ProjectUniforms {
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

  uniforms.wrapLongitude = autoWrapLongitude;
  uniforms.modelMatrix = modelMatrix || IDENTITY_MATRIX;

  return uniforms;
}

function calculateViewportUniforms({
  viewport,
  devicePixelRatio,
  coordinateSystem,
  coordinateOrigin
}: {
  viewport: Viewport;
  devicePixelRatio: number;
  coordinateSystem: CoordinateSystem;
  coordinateOrigin: Vec3;
}): ProjectUniforms {
  const {
    projectionCenter,
    viewProjectionMatrix,
    originCommon,
    cameraPosCommon,
    shaderCoordinateOrigin,
    geospatialOrigin
  } = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin);

  // Calculate projection pixels per unit
  const distanceScales = viewport.getDistanceScales();

  const viewportSize: [number, number] = [
    viewport.width * devicePixelRatio,
    viewport.height * devicePixelRatio
  ];

  // Distance at which screen pixels are projected.
  // Used to scale sizes in clipspace to match screen pixels.
  // When using Viewport class's default projection matrix, this yields 1 for orthographic
  // and `viewport.focalDistance` for perspective views
  const focalDistance =
    vec4.transformMat4([], [0, 0, -viewport.focalDistance, 1], viewport.projectionMatrix)[3] || 1;

  const uniforms: ProjectUniforms = {
    // Projection mode values
    coordinateSystem,
    projectionMode: viewport.projectionMode,
    coordinateOrigin: shaderCoordinateOrigin,
    commonOrigin: originCommon.slice(0, 3) as Vec3,
    center: projectionCenter,

    // Backward compatibility
    // TODO: remove in v9
    // @ts-expect-error _pseudoMeters is only defined on WebMercator viewport
    pseudoMeters: Boolean(viewport._pseudoMeters),

    // Screen size
    viewportSize,
    devicePixelRatio,

    focalDistance,
    commonUnitsPerMeter: distanceScales.unitsPerMeter as Vec3,
    commonUnitsPerWorldUnit: distanceScales.unitsPerMeter as Vec3,
    commonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    scale: viewport.scale, // This is the mercator scale (2 ** zoom)
    wrapLongitude: false,

    viewProjectionMatrix,
    modelMatrix: IDENTITY_MATRIX,

    // This is for lighting calculations
    cameraPosition: cameraPosCommon
  };

  if (geospatialOrigin) {
    // Get high-precision DistanceScales from geospatial viewport
    // TODO: stricter types in Viewport classes
    const distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin) as {
      unitsPerMeter: Vec3;
      metersPerUnit: Vec3;
      unitsPerMeter2: Vec3;
      unitsPerDegree: Vec3;
      degreesPerUnit: Vec3;
      unitsPerDegree2: Vec3;
    };
    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        break;

      case COORDINATE_SYSTEM.LNGLAT:
      case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
        // @ts-expect-error _pseudoMeters only exists on WebMercatorView
        if (!viewport._pseudoMeters) {
          uniforms.commonUnitsPerMeter = distanceScalesAtOrigin.unitsPerMeter;
        }
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
        break;

      // a.k.a "preprojected" positions
      case COORDINATE_SYSTEM.CARTESIAN:
        uniforms.commonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.commonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;

      default:
        break;
    }
  }

  return uniforms;
}
