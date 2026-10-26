// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable complexity, camelcase */

import {Matrix4Like} from '@math.gl/core';
import * as mat4 from '@math.gl/core/mat4';
import * as vec4 from '@math.gl/core/vec4';

import {COORDINATE_SYSTEM, PROJECTION_MODE} from './constants';

import {getPackedCoordinateSystem} from './coordinate-systems';
import memoize from '../../utils/memoize';

import type {CRSDescriptor} from '@math.gl/projection/core';
import type Viewport from '../../viewports/viewport';
import type {Buffer, Texture} from '@luma.gl/core';
import type {CoordinateSystem} from '../../lib/constants';

type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

// To quickly set a vector to zero
const ZERO_VECTOR: Vec4 = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
const VECTOR_TO_POINT_MATRIX: Matrix4Like = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX: Matrix4Like = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const DEFAULT_COORDINATE_ORIGIN: Vec3 = [0, 0, 0];

/** Uniform frame of normalized, packed attributes. */
export function getShaderCoordinateFrame(coordinateSystem: string, viewport: Viewport): number {
  switch (coordinateSystem) {
    case 'lnglat':
    case 'lnglat-offsets':
      return COORDINATE_SYSTEM.GEODETIC;
    case 'meter-offsets':
      return COORDINATE_SYSTEM.IDENTITY;
    case 'cartesian':
      switch (viewport.crs?.coordinateFrame) {
        case 'geographic':
          return COORDINATE_SYSTEM.GEODETIC;
        case 'geocentric':
          return COORDINATE_SYSTEM.GEOCENTRIC;
        case 'projected':
          return COORDINATE_SYSTEM.PROJECTED;
        default:
          return COORDINATE_SYSTEM.IDENTITY;
      }
    default:
      throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
  }
}

/** Offset algorithms are projection modes, not absolute attribute frames. */
function getShaderProjectionMode(projectionMode: number, coordinateSystem: string): number {
  switch (coordinateSystem) {
    case 'meter-offsets':
      switch (projectionMode) {
        case PROJECTION_MODE.GLOBE:
          return PROJECTION_MODE.GLOBE_METER_OFFSETS;
        case PROJECTION_MODE.WEB_MERCATOR:
        case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
        case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
          return PROJECTION_MODE.METER_OFFSETS;
      }
      break;
    case 'lnglat-offsets':
      switch (projectionMode) {
        case PROJECTION_MODE.WEB_MERCATOR:
        case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
          return PROJECTION_MODE.GEODETIC_OFFSETS;
      }
      break;
  }
  return projectionMode;
}

const getMemoizedViewportUniforms = memoize(calculateViewportUniforms);

export function getOffsetOrigin(
  viewport: Viewport,
  coordinateSystem: CoordinateSystem,
  coordinateOrigin: Vec3 = DEFAULT_COORDINATE_ORIGIN,
  sourceCrs?: CRSDescriptor | null
): {
  geospatialOrigin: Vec3 | null;
  shaderCoordinateOrigin: Vec3;
  commonOrigin?: Vec3;
  offsetMode: boolean;
} {
  if (coordinateOrigin.length < 3) {
    coordinateOrigin = [coordinateOrigin[0], coordinateOrigin[1], 0];
  }

  let shaderCoordinateOrigin = coordinateOrigin;
  let commonOrigin: Vec3 | undefined;
  const packed = getPackedCoordinateSystem(coordinateSystem, viewport, sourceCrs);
  coordinateSystem = packed.coordinateSystem;
  if (packed.preprojected) {
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN;
  }
  let geospatialOrigin: Vec3 | null;
  let offsetMode = true;

  switch (coordinateSystem) {
    case 'lnglat-offsets':
    case 'meter-offsets':
      geospatialOrigin = coordinateOrigin;
      break;
    default:
      geospatialOrigin = viewport.isGeospatial
        ? // @ts-expect-error longitude and latitude belong to geospatial subclasses
          [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0]
        : null;
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      switch (coordinateSystem) {
        case 'lnglat':
          geospatialOrigin = [0, 0, 0];
          offsetMode = false;
          break;
        case 'cartesian':
          // Cartesian Z retains the camera's meter scale across Mercator precision modes.
          offsetMode = false;
          geospatialOrigin = viewport.unprojectPosition([
            Math.fround(viewport.center[0]),
            Math.fround(viewport.center[1]),
            0
          ]);
          break;
      }
      break;
    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      switch (coordinateSystem) {
        case 'lnglat':
          // @ts-expect-error geospatialOrigin is defined for Mercator geographic input
          shaderCoordinateOrigin = geospatialOrigin;
          break;
        case 'cartesian':
          shaderCoordinateOrigin = [
            Math.fround(viewport.center[0]),
            Math.fround(viewport.center[1]),
            0
          ];
          geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
          shaderCoordinateOrigin[0] -= coordinateOrigin[0];
          shaderCoordinateOrigin[1] -= coordinateOrigin[1];
          shaderCoordinateOrigin[2] -= coordinateOrigin[2];
          break;
      }
      break;

    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround) as Vec3;
      shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
      break;

    case PROJECTION_MODE.CUSTOM_GEOSPATIAL: {
      if (coordinateSystem === 'meter-offsets') {
        // Only the geographic anchor is projected; attributes remain local meters.
        shaderCoordinateOrigin = DEFAULT_COORDINATE_ORIGIN;
        commonOrigin = viewport.projectPosition(coordinateOrigin);
        break;
      }
      geospatialOrigin = null;
      const scale = viewport.distanceScales.unitsPerWorldUnit;
      // Round in the units stored in position attributes, so the GPU receives
      // this exact origin. Derive its common position from the same value.
      shaderCoordinateOrigin = viewport.center.map((value, i) =>
        Math.fround(value / scale[i] - coordinateOrigin[i])
      ) as Vec3;
      commonOrigin = shaderCoordinateOrigin.map(
        (value, i) => (value + coordinateOrigin[i]) * scale[i]
      ) as Vec3;
      break;
    }

    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;

    default:
      // Unknown projection mode
      offsetMode = false;
  }

  return {geospatialOrigin, shaderCoordinateOrigin, commonOrigin, offsetMode};
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
  const {geospatialOrigin, shaderCoordinateOrigin, commonOrigin, offsetMode} = getOffsetOrigin(
    viewport,
    coordinateSystem,
    coordinateOrigin
  );

  if (offsetMode) {
    // Calculate transformed projectionCenter (using 64 bit precision JS)
    // This is the key to offset mode precision
    // (avoids doing this addition in 32 bit precision in GLSL)
    // @ts-expect-error the 4th component is assigned below
    originCommon =
      commonOrigin || viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);

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
  /** Coordinate frame of packed attributes; independent of the layer CRS identifier. */
  coordinateFrame: number;
  projectionMode: number;
  coordinateOrigin: Vec3;
  commonOrigin: Vec3;
  center: Vec4;
  // Backward compatibility
  // TODO: remove in v9
  pseudoMeters: boolean;
  /** Width and height of the square local size-scale field. */
  sizeScaleSize: number;
  /** Map-meter XY to sampler-space XY scale and translation. */
  sizeScaleTransform: [number, number, number, number];

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
  /** Scalar XY scale, X/Y slopes and Z scale: float32 storage buffer on WebGPU,
   * RGBA32Uint float-bit texture on WebGL. Required when USE_EXTERNAL_PROJECTION
   * is enabled; ordinary projection shader variants do not use this binding.
   */
  sizeScale?: Buffer | Texture;
  /** Mapping associated with the bound scale field, when using a separate aggregation viewport. */
  sizeScaleTransform?: [number, number, number, number];
  devicePixelRatio?: number;
  modelMatrix?: Matrix4Like | null;
  coordinateSystem?: CoordinateSystem;
  /** Resolved source descriptor supplied by the layer; omitted for standalone shader use. */
  sourceCrs?: CRSDescriptor | null;
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
  coordinateSystem = 'default',
  coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
  autoWrapLongitude = false,
  sourceCrs
}: ProjectProps): ProjectUniforms {
  const packed = getPackedCoordinateSystem(coordinateSystem, viewport, sourceCrs);
  coordinateSystem = packed.coordinateSystem;
  switch (coordinateSystem) {
    case 'lnglat-offsets':
      switch (viewport.projectionMode) {
        case PROJECTION_MODE.GLOBE:
          // Geographic offsets on a globe are WGS84 coordinates plus their source origin.
          coordinateSystem = 'lnglat';
          break;
      }
      break;
  }
  if (
    !packed.preprojected &&
    coordinateSystem === 'lnglat' &&
    coordinateOrigin.some(value => value !== 0)
  ) {
    // Apply the source-CRS origin before projection without selecting a local
    // Taylor approximation: an arbitrary origin need not be near the camera.
    const translated = Array.from(modelMatrix || IDENTITY_MATRIX);
    translated[12] += coordinateOrigin[0];
    translated[13] += coordinateOrigin[1];
    translated[14] += coordinateOrigin[2] || 0;
    modelMatrix = translated as Matrix4Like;
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN;
  }
  if (packed.preprojected) {
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN;
    modelMatrix = null;
    autoWrapLongitude = false;
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
  coordinateSystem: string;
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
    coordinateFrame: getShaderCoordinateFrame(coordinateSystem, viewport),
    projectionMode: getShaderProjectionMode(viewport.projectionMode, coordinateSystem),
    coordinateOrigin: shaderCoordinateOrigin,
    commonOrigin: originCommon.slice(0, 3) as Vec3,
    center: projectionCenter,

    // Backward compatibility
    // TODO: remove in v9
    // @ts-expect-error _pseudoMeters is only defined on WebMercator viewport
    pseudoMeters: Boolean(viewport._pseudoMeters),
    sizeScaleSize: 1,
    sizeScaleTransform: [1, 1, 0, 0],

    // Screen size
    viewportSize,
    devicePixelRatio,

    focalDistance,
    commonUnitsPerMeter: distanceScales.unitsPerMeter,
    commonUnitsPerWorldUnit: distanceScales.unitsPerWorldUnit,
    commonUnitsPerWorldUnit2: distanceScales.unitsPerWorldUnit2,
    scale: viewport.scale, // This is the mercator scale (2 ** zoom)
    wrapLongitude: false,

    viewProjectionMatrix,
    modelMatrix: IDENTITY_MATRIX,

    // This is for lighting calculations
    cameraPosition: cameraPosCommon
  };

  if (geospatialOrigin) {
    // Get high-precision DistanceScales from geospatial viewport
    const scaleOrigin =
      viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL
        ? viewport.crs!.converter.WGS84.from(geospatialOrigin)
        : geospatialOrigin;
    const distanceScalesAtOrigin = viewport.getDistanceScales(scaleOrigin);
    switch (coordinateSystem) {
      case 'meter-offsets':
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        if (viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL) {
          uniforms.commonUnitsPerMeter = distanceScalesAtOrigin.unitsPerMeter;
        }
        break;

      case 'lnglat':
      case 'lnglat-offsets':
        // @ts-expect-error _pseudoMeters only exists on WebMercatorView
        if (!viewport._pseudoMeters) {
          uniforms.commonUnitsPerMeter = distanceScalesAtOrigin.unitsPerMeter;
        }
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerWorldUnit;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerWorldUnit2;
        break;

      // a.k.a "preprojected" positions
      case 'cartesian':
        uniforms.commonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.commonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;

      default:
        break;
    }
  }

  // For GLOBE + METER_OFFSETS, precompute the globe-space position of
  // coordinateOrigin into commonOrigin. The shader derives the ENU frame from
  // this direction via project_get_orientation_matrix, avoiding per-vertex trig.
  if (viewport.projectionMode === PROJECTION_MODE.GLOBE && coordinateSystem === 'meter-offsets') {
    const EARTH_RADIUS = 6370972;
    const GLOBE_RADIUS = 256;
    const lambda = (coordinateOrigin[0] * Math.PI) / 180;
    const phi = (coordinateOrigin[1] * Math.PI) / 180;
    const cosPhi = Math.cos(phi);
    const D = ((coordinateOrigin[2] || 0) / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;
    uniforms.commonOrigin = [
      Math.sin(lambda) * cosPhi * D,
      -Math.cos(lambda) * cosPhi * D,
      Math.sin(phi) * D
    ];
  }

  return uniforms;
}
