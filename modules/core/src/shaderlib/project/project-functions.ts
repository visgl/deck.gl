/**
 * Projection utils
 * TODO: move to Viewport class?
 */
import {COORDINATE_SYSTEM} from '../../lib/constants';
import {getOffsetOrigin} from './viewport-uniforms';
import WebMercatorViewport from '../../viewports/web-mercator-viewport';

import * as vec4 from 'gl-matrix/vec4';
import * as vec3 from 'gl-matrix/vec3';
import {addMetersToLngLat} from '@math.gl/web-mercator';

import type {CoordinateSystem} from '../../lib/constants';
import type Viewport from '../../viewports/viewport';
import type {NumericArray} from '../../types/types';

const DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];

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
  const {viewport, modelMatrix, coordinateOrigin} = opts;
  let {coordinateSystem, fromCoordinateSystem, fromCoordinateOrigin} = opts;

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial
      ? COORDINATE_SYSTEM.LNGLAT
      : COORDINATE_SYSTEM.CARTESIAN;
  }

  if (fromCoordinateSystem === undefined) {
    fromCoordinateSystem = coordinateSystem;
  }
  if (fromCoordinateOrigin === undefined) {
    fromCoordinateOrigin = coordinateOrigin;
  }

  return {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix,
    fromCoordinateSystem,
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
    coordinateOrigin,
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

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);

    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      return lngLatZToWorldPosition(
        [x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)],
        viewport,
        offsetMode
      );

    case COORDINATE_SYSTEM.METER_OFFSETS:
      return lngLatZToWorldPosition(
        addMetersToLngLat(coordinateOrigin, [x, y, z]) as [number, number, number],
        viewport,
        offsetMode
      );

    case COORDINATE_SYSTEM.CARTESIAN:
    default:
      return viewport.isGeospatial
        ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]]
        : viewport.projectPosition([x, y, z]);
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
    /** The coordinate origin that the supplied position is in. Default to the same as `coordinateOrigin`. */
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
    const positionCommonSpace = viewport.projectPosition(
      geospatialOrigin || shaderCoordinateOrigin
    );
    vec3.sub(worldPosition, worldPosition, positionCommonSpace);
  }

  return worldPosition;
}
