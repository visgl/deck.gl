// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Projection utils
 * TODO: move to Viewport class?
 */
import {getSourceCRS} from './coordinate-systems';
import {getOffsetOrigin} from './viewport-uniforms';
import WebMercatorViewport from '../../viewports/web-mercator-viewport';
import {PROJECTION_MODE} from './constants';

import * as vec3 from '@math.gl/core/vec3';
import * as vec4 from '@math.gl/core/vec4';
import {addMetersToLngLat} from '@math.gl/web-mercator';

import type {CoordinateSystem} from '../../lib/constants';
import type Viewport from '../../viewports/viewport';
import type {NumericArray} from '../../types/types';

const DEFAULT_COORDINATE_ORIGIN: [number, number, number] = [0, 0, 0];

// In project.glsl, offset modes calculate z differently from LNG_LAT mode.
// offset modes apply the y adjustment (unitsPerMeter2) when projecting z
// LNG_LAT mode only use the linear scale.
function lngLatZToWorldPosition(
  lngLatZ: [number, number, number],
  viewport: Viewport,
  offsetMode: boolean = false
): [number, number, number] {
  const p = viewport.projectPosition(lngLatZ);

  // TODO - avoid using instanceof
  if (offsetMode && viewport instanceof WebMercatorViewport) {
    const [longitude, latitude, z = 0] = lngLatZ;
    const distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }
  return p;
}

function resolveCoordinateSystem(
  coordinateSystem: CoordinateSystem,
  viewport: Viewport
): CoordinateSystem {
  switch (viewport.projectionMode) {
    case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
      return coordinateSystem;
  }
  switch (coordinateSystem) {
    case 'default':
      return viewport.isGeospatial ? 'lnglat' : 'cartesian';
    default:
      return coordinateSystem;
  }
}

function normalizeParameters(opts: {
  viewport: Viewport;
  coordinateSystem: CoordinateSystem;
  coordinateOrigin: [number, number, number];
  modelMatrix?: NumericArray | null;
  fromCoordinateSystem?: CoordinateSystem;
  fromCoordinateOrigin?: [number, number, number];
}): {
  viewport: Viewport;
  coordinateSystem: CoordinateSystem;
  coordinateOrigin: [number, number, number];
  modelMatrix?: NumericArray | null;
  fromCoordinateSystem: CoordinateSystem;
  fromCoordinateOrigin: [number, number, number];
} {
  const {
    viewport,
    modelMatrix,
    coordinateSystem,
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
    fromCoordinateSystem = coordinateSystem,
    fromCoordinateOrigin = fromCoordinateSystem === coordinateSystem
      ? coordinateOrigin
      : DEFAULT_COORDINATE_ORIGIN
  } = opts;

  return {
    viewport,
    coordinateSystem: resolveCoordinateSystem(coordinateSystem, viewport),
    coordinateOrigin,
    modelMatrix,
    fromCoordinateSystem: resolveCoordinateSystem(fromCoordinateSystem, viewport),
    fromCoordinateOrigin
  };
}

/** Get the common space position from world coordinates in the given coordinate system */
export function getWorldPosition(
  position: number[],
  {
    viewport,
    modelMatrix,
    coordinateSystem,
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
    offsetMode
  }: {
    viewport: Viewport;
    modelMatrix?: NumericArray | null;
    coordinateSystem: CoordinateSystem;
    coordinateOrigin: [number, number, number];
    offsetMode?: boolean;
  }
): [number, number, number] {
  let [x, y, z = 0] = position;

  if (modelMatrix) {
    [x, y, z] = vec4.transformMat4([], [x, y, z, 1.0], modelMatrix);
  }

  const sourceCrs = getSourceCRS(coordinateSystem, viewport);
  if (sourceCrs) {
    const {preproject} = viewport.getPreprojection(sourceCrs);
    if (preproject) {
      const packed = preproject([
        x + coordinateOrigin[0],
        y + coordinateOrigin[1],
        z + coordinateOrigin[2]
      ]);
      switch (viewport.projectionMode) {
        case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
          return packed.map(
            (value, axis) => value * viewport.distanceScales.unitsPerWorldUnit[axis]
          ) as [number, number, number];
        default:
          return lngLatZToWorldPosition(packed, viewport, offsetMode);
      }
    }
    switch (viewport.projectionMode) {
      case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
        return [x, y, z].map(
          (value, axis) =>
            (value + coordinateOrigin[axis]) * viewport.distanceScales.unitsPerWorldUnit[axis]
        ) as [number, number, number];
    }
    switch (coordinateSystem) {
      case 'lnglat-offsets':
        break;
      default:
        x += coordinateOrigin[0];
        y += coordinateOrigin[1];
        z += coordinateOrigin[2] || 0;
        coordinateSystem = 'lnglat';
    }
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
      switch (coordinateSystem) {
        case 'meter-offsets': {
          const origin = viewport.projectPosition(coordinateOrigin);
          const targetOrigin = viewport.crs!.converter.WGS84.from(coordinateOrigin);
          const {unitsPerMeter} = viewport.getDistanceScales(targetOrigin);
          return [
            origin[0] + x * unitsPerMeter[0],
            origin[1] + y * unitsPerMeter[1],
            origin[2] + z * unitsPerMeter[2]
          ];
        }
        case 'cartesian': {
          const scale = viewport.distanceScales.unitsPerWorldUnit;
          return [
            (x + coordinateOrigin[0]) * scale[0],
            (y + coordinateOrigin[1]) * scale[1],
            (z + coordinateOrigin[2]) * scale[2]
          ];
        }
        default:
          return viewport.projectPosition([x, y, z]);
      }
  }

  switch (coordinateSystem) {
    case 'default':
      return getWorldPosition(position, {
        viewport,
        modelMatrix,
        coordinateSystem: viewport.isGeospatial ? 'lnglat' : 'cartesian',
        coordinateOrigin,
        offsetMode
      });

    case 'lnglat':
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);

    case 'lnglat-offsets':
      return lngLatZToWorldPosition(
        [x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)],
        viewport,
        offsetMode
      );

    case 'meter-offsets':
      return lngLatZToWorldPosition(
        addMetersToLngLat(coordinateOrigin, [x, y, z]) as [number, number, number],
        viewport,
        offsetMode
      );

    case 'cartesian':
      return viewport.isGeospatial
        ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]]
        : viewport.projectPosition([x, y, z]);

    default:
      throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
  }
}

/**
 * Equivalent to project_position in project.glsl
 * projects a user supplied position to world position directly with or without
 * a reference coordinate system
 */
export function projectPosition(
  position: number[],
  params: {
    /** The current viewport */
    viewport: Viewport;
    /** The reference coordinate system used to align world position */
    coordinateSystem: CoordinateSystem;
    /** The reference coordinate origin used to align world position */
    coordinateOrigin: [number, number, number];
    /** The model matrix of the supplied position */
    modelMatrix?: NumericArray | null;
    /** The coordinate system that the supplied position is in. Default to the same as `coordinateSystem`. */
    fromCoordinateSystem?: CoordinateSystem;
    /** The source coordinate origin. Defaults to `coordinateOrigin` for the same source system, or zero for a different system. */
    fromCoordinateOrigin?: [number, number, number];
    /** Whether to apply offset mode automatically as does the project shader module.
     * Offset mode places the origin of the common space at the given viewport's center. It is used in some use cases
     * to improve precision in the vertex shader due to the fp32 float limitation.
     * Use `autoOffset:false` if the returned position should not be dependent on the current viewport.
     * Default `true` */
    autoOffset?: boolean;
  }
): [number, number, number] {
  const {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix,
    fromCoordinateSystem,
    fromCoordinateOrigin
  } = normalizeParameters(params);
  const {autoOffset = true} = params;

  const {
    geospatialOrigin = DEFAULT_COORDINATE_ORIGIN,
    shaderCoordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
    commonOrigin,
    offsetMode = false
  } = autoOffset ? getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin) : {};

  const worldPosition = getWorldPosition(position, {
    viewport,
    modelMatrix,
    coordinateSystem: fromCoordinateSystem,
    coordinateOrigin: fromCoordinateOrigin,
    offsetMode
  });

  if (offsetMode) {
    const positionCommonSpace =
      commonOrigin || viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    vec3.sub(worldPosition, worldPosition, positionCommonSpace);
  }

  return worldPosition;
}
