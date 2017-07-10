// TODO - THESE UTILITIES COULD BE IMPORTED FROM WEB_MERCATOR_VIEWPORT
import mat4_perspective from 'gl-mat4/perspective';
import mat4_scale from 'gl-mat4/scale';
import mat4_translate from 'gl-mat4/translate';
import mat4_rotateX from 'gl-mat4/rotateX';
import mat4_rotateZ from 'gl-mat4/rotateZ';
import vec2_distance from 'gl-vec2/distance';
import assert from 'assert';

// CONSTANTS
const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
const WORLD_SCALE = TILE_SIZE;

const METERS_PER_DEGREE_AT_EQUATOR = 111000; // Approximately 111km per degree at equator

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
 * Performs the nonlinear part of the web mercator projection.
 * Remaining projection is done with 4x4 matrices which also handles
 * perspective.
 *
 * @param {Array} lngLat - [lng, lat] coordinates
 *   Specifies a point on the sphere to project onto the map.
 * @return {Array} [x,y] coordinates.
 */
export function projectFlat([lng, lat], scale) {
  scale = scale * WORLD_SCALE;
  const lambda2 = lng * DEGREES_TO_RADIANS;
  const phi2 = lat * DEGREES_TO_RADIANS;
  const x = scale * (lambda2 + PI) / (2 * PI);
  const y = scale * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI);
  return [x, y];
}

/**
 * Unproject world point [x,y] on map onto {lat, lon} on sphere
 *
 * @param {object|Vector} xy - object with {x,y} members
 *  representing point on projected map plane
 * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
 *   Has toArray method if you need a GeoJSON Array.
 *   Per cartographic tradition, lat and lon are specified as degrees.
 */
export function unprojectFlat([x, y], scale) {
  scale = scale * WORLD_SCALE;
  const lambda2 = (x / scale) * (2 * PI) - PI;
  const phi2 = 2 * (Math.atan(Math.exp(PI - (y / scale) * (2 * PI))) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}

/**
 * Calculate distance scales in meters around current lat/lon, both for
 * degrees and pixels.
 * In mercator projection mode, the distance scales vary significantly
 * with latitude.
 */
export function calculateDistanceScales({latitude, longitude, zoom, scale}) {
  // Calculate scale from zoom if not provided
  scale = scale !== undefined ? scale : Math.pow(2, zoom);

  assert(!isNaN(latitude) && !isNaN(longitude) && !isNaN(scale));

  const latCosine = Math.cos(latitude * Math.PI / 180);

  const metersPerDegree = METERS_PER_DEGREE_AT_EQUATOR * latCosine;

  // Calculate number of pixels occupied by one degree longitude
  // around current lat/lon
  const pixelsPerDegreeX = vec2_distance(
    projectFlat([longitude + 0.5, latitude], scale),
    projectFlat([longitude - 0.5, latitude], scale)
  );
  // Calculate number of pixels occupied by one degree latitude
  // around current lat/lon
  const pixelsPerDegreeY = vec2_distance(
    projectFlat([longitude, latitude + 0.5], scale),
    projectFlat([longitude, latitude - 0.5], scale)
  );

  const pixelsPerMeterX = pixelsPerDegreeX / metersPerDegree;
  const pixelsPerMeterY = pixelsPerDegreeY / metersPerDegree;
  const pixelsPerMeterZ = (pixelsPerMeterX + pixelsPerMeterY) / 2;
  // const pixelsPerMeter = [pixelsPerMeterX, pixelsPerMeterY, pixelsPerMeterZ];

  const worldSize = TILE_SIZE * scale;
  const altPixelsPerMeter = worldSize / (4e7 * latCosine);
  const pixelsPerMeter = [altPixelsPerMeter, altPixelsPerMeter, altPixelsPerMeter];
  const metersPerPixel = [1 / altPixelsPerMeter, 1 / altPixelsPerMeter, 1 / pixelsPerMeterZ];

  const pixelsPerDegree = [pixelsPerDegreeX, pixelsPerDegreeY, pixelsPerMeterZ];
  const degreesPerPixel = [1 / pixelsPerDegreeX, 1 / pixelsPerDegreeY, 1 / pixelsPerMeterZ];

  // Main results, used for converting meters to latlng deltas and scaling offsets
  return {
    pixelsPerMeter,
    metersPerPixel,
    pixelsPerDegree,
    degreesPerPixel
  };
}

// ATTRIBUTION:
// view and projection matrix creation is intentionally kept compatible with
// mapbox-gl's implementation to ensure that seamless interoperation
// with mapbox and react-map-gl. See: https://github.com/mapbox/mapbox-gl-js

// Variable fov (in radians)
export function getFov({height, altitude}) {
  return 2 * Math.atan((height / 2) / altitude);
}

export function getClippingPlanes({altitude, pitch}) {
  // Find the distance from the center point to the center top
  // in altitude units using law of sines.
  const pitchRadians = pitch * DEGREES_TO_RADIANS;
  const halfFov = Math.atan(0.5 / altitude);
  const topHalfSurfaceDistance =
    Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);

  // Calculate z value of the farthest fragment that should be rendered.
  const farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;

  return {farZ, nearZ: 0.1};
}

// PROJECTION MATRIX: PROJECTS FROM CAMERA (VIEW) SPACE TO CLIPSPACE
export function makeProjectionMatrixFromMercatorParams({
  width,
  height,
  pitch,
  altitude,
  farZMultiplier = 10
}) {
  const {nearZ, farZ} = getClippingPlanes({altitude, pitch});
  const fov = getFov({height, altitude});

  const projectionMatrix = mat4_perspective(
    createMat4(),
    fov,              // fov in radians
    width / height,   // aspect ratio
    nearZ,            // near plane
    farZ * farZMultiplier // far plane
  );

  return projectionMatrix;
}

export function makeUncenteredViewMatrixFromMercatorParams({
  width,
  height,
  longitude,
  latitude,
  zoom,
  pitch,
  bearing,
  altitude,
  center
}) {
  // VIEW MATRIX: PROJECTS FROM VIRTUAL PIXELS TO CAMERA SPACE
  // Note: As usual, matrix operation orders should be read in reverse
  // since vectors will be multiplied from the right during transformation
  const vm = createMat4();

  // Move camera to altitude
  mat4_translate(vm, vm, [0, 0, -altitude]);

  // After the rotateX, z values are in pixel units. Convert them to
  // altitude units. 1 altitude unit = the screen height.
  mat4_scale(vm, vm, [1, -1, 1 / height]);

  // Rotate by bearing, and then by pitch (which tilts the view)
  mat4_rotateX(vm, vm, pitch * DEGREES_TO_RADIANS);
  mat4_rotateZ(vm, vm, -bearing * DEGREES_TO_RADIANS);

  return vm;
}
