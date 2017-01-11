// View and Projection Matrix calculations for mapbox-js style
// map view properties
import Viewport, {createMat4} from './viewport';
import {mat4, vec4, vec2} from 'gl-matrix';

// CONSTANTS
const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
const WORLD_SCALE = TILE_SIZE / (2 * PI);

const DEFAULT_MAP_STATE = {
  latitude: 37,
  longitude: -122,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

export default class WebMercatorViewport extends Viewport {
  /**
   * @classdesc
   * Creates view/projection matrices from mercator params
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   *
   * @class
   * @param {Object} opt - options
   * @param {Boolean} mercator=true - Whether to use mercator projection
   *
   * @param {Number} opt.width=1 - Width of "viewport" or window
   * @param {Number} opt.height=1 - Height of "viewport" or window
   * @param {Array} opt.center=[0, 0] - Center of viewport
   *   [longitude, latitude] or [x, y]
   * @param {Number} opt.scale=1 - Either use scale or zoom
   * @param {Number} opt.pitch=0 - Camera angle in degrees (0 is straight down)
   * @param {Number} opt.bearing=0 - Map rotation in degrees (0 means north is up)
   * @param {Number} opt.altitude= - Altitude of camera in screen units
   *
   * Web mercator projection short-hand parameters
   * @param {Number} opt.latitude - Center of viewport on map (alternative to opt.center)
   * @param {Number} opt.longitude - Center of viewport on map (alternative to opt.center)
   * @param {Number} opt.zoom - Scale = Math.pow(2,zoom) on map (alternative to opt.scale)

   * Notes:
   *  - Only one of center or [latitude, longitude] can be specified
   *  - [latitude, longitude] can only be specified when "mercator" is true
   *  - Altitude has a default value that matches assumptions in mapbox-gl
   *  - width and height are forced to 1 if supplied as 0, to avoid
   *    division by zero. This is intended to reduce the burden of apps to
   *    to check values before instantiating a Viewport.
   */
  /* eslint-disable complexity, max-statements */
  constructor({
    // Map state
    width,
    height,
    latitude,
    longitude,
    zoom,
    pitch,
    bearing,
    altitude,
    mercatorEnabled
  } = {}) {
    // Viewport - support undefined arguments
    width = width !== undefined ? width : DEFAULT_MAP_STATE.width;
    height = height !== undefined ? height : DEFAULT_MAP_STATE.height;
    zoom = zoom !== undefined ? zoom : DEFAULT_MAP_STATE.zoom;
    latitude = latitude !== undefined ? latitude : DEFAULT_MAP_STATE.latitude;
    longitude = longitude !== undefined ? longitude : DEFAULT_MAP_STATE.longitude;
    bearing = bearing !== undefined ? bearing : DEFAULT_MAP_STATE.bearing;
    pitch = pitch !== undefined ? pitch : DEFAULT_MAP_STATE.pitch;
    altitude = altitude !== undefined ? altitude : DEFAULT_MAP_STATE.altitude;

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    const scale = Math.pow(2, zoom);
    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    const distanceScales = calculateDistanceScales({latitude, longitude, scale});

    const projectionMatrix = makeProjectionMatrixFromMercatorParams({
      width,
      height,
      pitch,
      bearing,
      altitude
    });

    const {viewMatrix, viewMatrixUncentered, viewCenter} =
      makeViewMatrixFromMercatorParams({
        width,
        height,
        longitude,
        latitude,
        zoom,
        pitch,
        bearing,
        altitude,
        distanceScales
      });

    super({width, height, viewMatrix, projectionMatrix});

    // Add additional matrices
    this.viewMatrixUncentered = viewMatrixUncentered;
    this.viewCenter = viewCenter;

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;

    this.scale = scale;

    this._distanceScales = distanceScales;

    this.getDistanceScales = this.getDistanceScales.bind(this);
    this.metersToLngLatDelta = this.metersToLngLatDelta.bind(this);
    this.lngLatDeltaToMeters = this.lngLatDeltaToMeters.bind(this);
    this.addMetersToLngLat = this.addMetersToLngLat.bind(this);
  }
  /* eslint-enable complexity, max-statements */

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
  _projectFlat(lngLat, scale = this.scale) {
    return projectFlat(lngLat, scale);
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
  _unprojectFlat(xy, scale = this.scale) {
    return unprojectFlat(xy, scale);
  }

  getDistanceScales() {
    return this._distanceScales;
  }

  /**
   * Converts a meter offset to a lnglat offset
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) - array of [lng,lat,z] deltas
   */
  metersToLngLatDelta(xyz) {
    const [x, y, z = 0] = xyz;
    const {pixelsPerMeter, degreesPerPixel} = this._distanceScales;
    const deltaLng = x * pixelsPerMeter[0] * degreesPerPixel[0];
    const deltaLat = y * pixelsPerMeter[1] * degreesPerPixel[1];
    return xyz.length === 2 ? [deltaLng, deltaLat] : [deltaLng, deltaLat, z];
  }

  /**
   * Converts a lnglat offset to a meter offset
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) deltaLngLatZ - array of [lng,lat,z] deltas
   * @return {[Number,Number]|[Number,Number,Number]) - array of meter deltas
   */
  lngLatDeltaToMeters(deltaLngLatZ) {
    const [deltaLng, deltaLat, deltaZ = 0] = deltaLngLatZ;
    const {pixelsPerDegree, metersPerPixel} = this._distanceScales;
    const deltaX = deltaLng * pixelsPerDegree[0] * metersPerPixel[0];
    const deltaY = deltaLat * pixelsPerDegree[1] * metersPerPixel[1];
    return deltaLngLatZ.length === 2 ? [deltaX, deltaY] : [deltaX, deltaY, deltaZ];
  }

  /**
   * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
   */
  addMetersToLngLat(lngLatZ, xyz) {
    const [lng, lat, Z = 0] = lngLatZ;
    const [deltaLng, deltaLat, deltaZ = 0] = this.metersToLngLatDelta(xyz);
    return lngLatZ.length === 2 ?
      [lng + deltaLng, lat + deltaLat] :
      [lng + deltaLng, lat + deltaLat, Z + deltaZ];
  }

  // INTERNAL METHODS

  _getParams() {
    return this._distanceScales;
  }
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
function projectFlat([lng, lat], scale) {
  scale = scale * WORLD_SCALE;
  const lambda2 = lng * DEGREES_TO_RADIANS;
  const phi2 = lat * DEGREES_TO_RADIANS;
  const x = scale * (lambda2 + PI);
  const y = scale * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5)));
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
function unprojectFlat([x, y], scale) {
  scale = scale * WORLD_SCALE;
  const lambda2 = x / scale - PI;
  const phi2 = 2 * (Math.atan(Math.exp(PI - y / scale)) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}

/**
 * Calculate distance scales in meters around current lat/lon, both for
 * degrees and pixels.
 * In mercator projection mode, the distance scales vary significantly
 * with latitude.
 */
function calculateDistanceScales({latitude, longitude, scale}) {
  // Approximately 111km per degree at equator
  const METERS_PER_DEGREE = 111000;

  const latCosine = Math.cos(latitude * Math.PI / 180);

  const metersPerDegree = METERS_PER_DEGREE * latCosine;

  // Calculate number of pixels occupied by one degree longitude
  // around current lat/lon
  const pixelsPerDegreeX = vec2.distance(
    projectFlat([longitude + 0.5, latitude]),
    projectFlat([longitude - 0.5, latitude])
  );
  // Calculate number of pixels occupied by one degree latitude
  // around current lat/lon
  const pixelsPerDegreeY = vec2.distance(
    projectFlat([longitude, latitude + 0.5]),
    projectFlat([longitude, latitude - 0.5])
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
function makeProjectionMatrixFromMercatorParams({
  width,
  height,
  pitch,
  altitude
}) {
  const pitchRadians = pitch * DEGREES_TO_RADIANS;

  // PROJECTION MATRIX: PROJECTS FROM CAMERA SPACE TO CLIPSPACE
  // Find the distance from the center point to the center top
  // in altitude units using law of sines.
  const halfFov = Math.atan(0.5 / altitude);
  const topHalfSurfaceDistance =
    Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);

  // Calculate z value of the farthest fragment that should be rendered.
  const farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;

  const projectionMatrix = mat4.perspective(
    createMat4(),
    2 * Math.atan((height / 2) / altitude), // fov in radians
    width / height,                         // aspect ratio
    0.1,                                    // near plane
    farZ * 10.0                             // far plane
  );

  return projectionMatrix;
}

function makeViewMatrixFromMercatorParams({
  width,
  height,
  longitude,
  latitude,
  zoom,
  pitch,
  bearing,
  altitude
}) {
  // Center x, y
  const scale = Math.pow(2, zoom);
  // VIEW MATRIX: PROJECTS FROM VIRTUAL PIXELS TO CAMERA SPACE
  // Note: As usual, matrix operation orders should be read in reverse
  // since vectors will be multiplied from the right during transformation
  const vm = createMat4();

  // Move camera to altitude
  mat4.translate(vm, vm, [0, 0, -altitude]);

  // After the rotateX, z values are in pixel units. Convert them to
  // altitude units. 1 altitude unit = the screen height.
  mat4.scale(vm, vm, [1, -1, 1 / height]);

  // Rotate by bearing, and then by pitch (which tilts the view)
  mat4.rotateX(vm, vm, pitch * DEGREES_TO_RADIANS);
  mat4.rotateZ(vm, vm, -bearing * DEGREES_TO_RADIANS);

  const [centerX, centerY] = projectFlat([longitude, latitude], scale);

  const center = [-centerX, -centerY, 0, 1];
  const viewCenter = vec4.transformMat4([], center, vm);

  const vmCentered = mat4.translate([], vm, [-centerX, -centerY, 0]);

  return {
    viewMatrix: vmCentered,
    viewMatrixUncentered: vm,
    viewCenter
  };
}
