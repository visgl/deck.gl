/**
 * Projection utils
 * TODO: move to Viewport class?
 */
import {COORDINATE_SYSTEM} from '../../lib/constants';
import {LNGLAT_AUTO_OFFSET_ZOOM_THRESHOLD} from './viewport-uniforms';

import vec4_transformMat4 from 'gl-vec4/transformMat4';
import vec3_sub from 'gl-vec3/subtract';
import {getDistanceScales} from 'viewport-mercator-project';

// In project.glsl, offset modes calculate z differently from LNG_LAT mode.
// offset modes apply the y adjustment (pixelsPerMeter2) when projecting z
// LNG_LAT mode only use the linear scale.
function lngLatZToWorldPosition(lngLatZ, viewport, offsetMode = true) {
  const [longitude, latitude, z = 0] = lngLatZ;
  const [X, Y] = viewport.projectFlat(lngLatZ);
  const distanceScales = offsetMode
    ? getDistanceScales({longitude, latitude, scale: viewport.scale})
    : viewport.getDistanceScales();
  const Z = z * distanceScales.pixelsPerMeter[2];
  return [X, Y, Z];
}

function normalizeParameters(opts) {
  const normalizedParams = Object.assign({}, opts);

  const {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    fromCoordinateSystem,
    fromCoordinateOrigin
  } = opts;

  if (fromCoordinateSystem === undefined) {
    normalizedParams.fromCoordinateSystem = coordinateSystem;
  }
  if (fromCoordinateOrigin === undefined) {
    normalizedParams.fromCoordinateOrigin = coordinateOrigin;
  }

  if (
    coordinateSystem === COORDINATE_SYSTEM.LNGLAT &&
    viewport.zoom >= LNGLAT_AUTO_OFFSET_ZOOM_THRESHOLD
  ) {
    normalizedParams.coordinateSystem = COORDINATE_SYSTEM.LNGLAT_OFFSETS;
    normalizedParams.coordinateOrigin = [
      Math.fround(viewport.longitude),
      Math.fround(viewport.latitude)
    ];
  }

  return normalizedParams;
}

/**
 * Equivalent to project_position in project.glsl
 * projects a user supplied position to world position in the target coordinates system
 * @param {array} position - [x, y, z]
 * @param {object} params
 * @param {Viewport} params.viewport - the current viewport
 * @param {number} params.coordinateSystem - the coordinate system to project into
 * @param {array} params.coordinateOrigin - the coordinate origin to project into
 * @param {Matrix4} [params.modelMatrix] - the model matrix of the supplied position
 * @param {number} [params.fromCoordinateSystem] - the coordinate system that the
 *   supplied position is in. Default to the same as `coordinateSystem`.
 * @param {array} [params.fromCoordinateOrigin] - the coordinate origin that the
 *   supplied position is in. Default to the same as `coordinateOrigin`.
 */
export function projectPosition(position, params) {
  let [x, y, z] = position;
  let worldPosition;

  const {
    // required
    viewport,
    coordinateSystem,
    coordinateOrigin,
    // optional
    modelMatrix,
    fromCoordinateSystem,
    fromCoordinateOrigin
  } = normalizeParameters(params);

  if (modelMatrix) {
    [x, y, z] = vec4_transformMat4([], [x, y, z, 1.0], modelMatrix);
  }

  let offsetMode = false;
  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
    case COORDINATE_SYSTEM.METER_OFFSETS:
      offsetMode = true;
      break;

    default:
  }

  // pre-project light coordinates
  switch (fromCoordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
    case COORDINATE_SYSTEM.LNGLAT_DEPRECATED:
      worldPosition = lngLatZToWorldPosition([x, y, z], viewport, offsetMode);
      break;

    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      worldPosition = lngLatZToWorldPosition(
        [
          x + fromCoordinateOrigin[0],
          y + fromCoordinateOrigin[1],
          z + (fromCoordinateOrigin[2] || 0)
        ],
        viewport,
        offsetMode
      );
      break;

    case COORDINATE_SYSTEM.METER_OFFSETS:
      worldPosition = lngLatZToWorldPosition(
        viewport.addMetersToLngLat(fromCoordinateOrigin, [x, y, z]),
        viewport,
        offsetMode
      );
      break;

    default:
      worldPosition = [x, y, z];
  }

  if (offsetMode) {
    const originWorld = lngLatZToWorldPosition(coordinateOrigin, viewport, offsetMode);
    vec3_sub(worldPosition, worldPosition, originWorld);
  }

  return worldPosition;
}
