/**
 * Projection utils
 * TODO: move to Viewport class?
 */
import {COORDINATE_SYSTEM} from '../../lib/constants';
import {getOffsetOrigin} from './viewport-uniforms';

import * as vec4 from 'gl-matrix/vec4';
import * as vec3 from 'gl-matrix/vec3';
import {addMetersToLngLat} from '@math.gl/web-mercator';

// In project.glsl, offset modes calculate z differently from LNG_LAT mode.
// offset modes apply the y adjustment (unitsPerMeter2) when projecting z
// LNG_LAT mode only use the linear scale.
function lngLatZToWorldPosition(lngLatZ, viewport, offsetMode = false) {
  const [longitude, latitude, z = 0] = lngLatZ;
  const [X, Y] = viewport.projectFlat(lngLatZ);
  const distanceScales = viewport.getDistanceScales(offsetMode && [longitude, latitude]);
  const Z = z * distanceScales.unitsPerMeter[2];
  return [X, Y, Z];
}

function normalizeParameters(opts) {
  const normalizedParams = Object.assign({}, opts);

  let {coordinateSystem} = opts;
  const {viewport, coordinateOrigin, fromCoordinateSystem, fromCoordinateOrigin} = opts;

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial
      ? COORDINATE_SYSTEM.LNGLAT
      : COORDINATE_SYSTEM.CARTESIAN;
  }

  if (fromCoordinateSystem === undefined) {
    normalizedParams.fromCoordinateSystem = coordinateSystem;
  }
  if (fromCoordinateOrigin === undefined) {
    normalizedParams.fromCoordinateOrigin = coordinateOrigin;
  }

  normalizedParams.coordinateSystem = coordinateSystem;

  return normalizedParams;
}

export function getWorldPosition(
  position,
  {viewport, modelMatrix, coordinateSystem, coordinateOrigin, offsetMode}
) {
  let [x, y, z] = position;

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
        addMetersToLngLat(coordinateOrigin, [x, y, z]),
        viewport,
        offsetMode
      );

    case COORDINATE_SYSTEM.CARTESIAN:
    default:
      return viewport.isGeospatial ? [x, y, z] : viewport.projectPosition([x, y, z]);
  }
}

/**
 * Equivalent to project_position in project.glsl
 * projects a user supplied position to world position directly with or without
 * a reference coordinate system
 * @param {array} position - [x, y, z]
 * @param {object} params
 * @param {Viewport} params.viewport - the current viewport
 * @param {number} params.coordinateSystem - the reference coordinate system used
 *   align world position
 * @param {array} params.coordinateOrigin - the reference coordinate origin used
 *   to align world position
 * @param {Matrix4} [params.modelMatrix] - the model matrix of the supplied position
 * @param {number} [params.fromCoordinateSystem] - the coordinate system that the
 *   supplied position is in. Default to the same as `coordinateSystem`.
 * @param {array} [params.fromCoordinateOrigin] - the coordinate origin that the
 *   supplied position is in. Default to the same as `coordinateOrigin`.
 */
export function projectPosition(position, params) {
  const {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    // optional
    modelMatrix,
    fromCoordinateSystem,
    fromCoordinateOrigin
  } = normalizeParameters(params);

  const {geospatialOrigin, shaderCoordinateOrigin, offsetMode} = getOffsetOrigin(
    viewport,
    coordinateSystem,
    coordinateOrigin
  );

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
