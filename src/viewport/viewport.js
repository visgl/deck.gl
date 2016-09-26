// View and Projection Matrix calculations for mapbox-js style
// map view properties
//
// ATTRIBUTION:
// The projection matrix creation algorithms are intentionally
// based on and kept compatible with the mapbox-gl-js implementation to
// ensure that seamless interoperation with mapbox and react-map-gl.
//
/* eslint-disable max-len */
// See: https://github.com/mapbox/mapbox-gl-js/blob/033043254d30a99a00b95660e296445a1ade2d01/js/geo/transform.js
/* elsint-enable max-len */

// We define a couple of coordinate systems:
// ------
// LatLon                      [lng, lat] = [-180 - 180, -81 - 81]
// Mercator World (zoom 0)     [x, y] = [0-512, y: 0-512]
// Mercator Zoomed (zoom N)    [x, y] = [0 - 512*2**N, 0 - 512*2**N]
// Translated                  [x, y] = zero centered
// Clip Space                  unit cube around view
// ------

import {mat2, mat4, vec4} from 'gl-matrix';
import autobind from 'autobind-decorator';
import assert from 'assert';

const PI = Math.PI;
const PI_2 = PI / 2;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
const WORLD_SCALE = TILE_SIZE / (2 * PI);

export const DEFAULT_MAP_STATE = {
  latitude: 37,
  longitude: -122,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

export default class Viewport {
  /**
   * @classdesc
   * Manages coordinate system transformations for deck.gl.
   *
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
    /* eslint-disable max-len */
    this.width = width !== undefined ? width : DEFAULT_MAP_STATE.width;
    this.height = height !== undefined ? height : DEFAULT_MAP_STATE.height;
    this.zoom = zoom !== undefined ? zoom : DEFAULT_MAP_STATE.zoom;
    this.latitude = latitude !== undefined ? latitude : DEFAULT_MAP_STATE.latitude;
    this.longitude = longitude !== undefined ? longitude : DEFAULT_MAP_STATE.longitude;
    this.bearing = bearing !== undefined ? bearing : DEFAULT_MAP_STATE.bearing;
    this.pitch = pitch !== undefined ? pitch : DEFAULT_MAP_STATE.pitch;
    this.altitude = altitude !== undefined ? altitude : DEFAULT_MAP_STATE.altitude;
    this.mercatorEnabled = mercatorEnabled !== undefined ? mercatorEnabled : true;
    /* eslint-enable max-len */

    // Silently allow apps to send in 0,0
    this.width = this.width || 1;
    this.height = this.height || 1;

    this._initialize();

    // Object.seal(this);
    // Object.freeze(this);
  }


  /**
   * Projects latitude and longitude to pixel coordinates in window
   * using viewport projection parameters
   * - [longitude, latitude] to [x, y]
   * - [longitude, latitude, Z] => [x, y, z]
   * Note: By default, returns top-left coordinates for canvas/SVG type render
   *
   * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether projected coords are top left
   * @return {Array} - [x, y] or [x, y, z] in top left coords
   */
  @autobind
  project(lngLatZ, {topLeft = true} = {}) {
    this._precomputePixelProjectionMatrices();
    const [X, Y] = this.mercatorEnabled ?
      this.projectFlat(lngLatZ) : lngLatZ;
    const v = [X, Y, lngLatZ[2] || 0, 1];
    // vec4.sub(v, v, [this.centerX, this.centerY, 0, 0]);
    vec4.transformMat4(v, v, this._pixelProjectionMatrix);
    // Divide by w
    const scale = 1 / v[3];
    vec4.multiply(v, v, [scale, scale, scale, scale]);
    const [x, y, z] = v;
    // const y2 = topLeft ? this.height - 1 - y : y;
    const y2 = topLeft ? this.height - y : y;
    return lngLatZ.length === 2 ? [x, y2] : [x, y2, z];
  }

  /**
   * Unproject pixel coordinates on screen onto [lon, lat] on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @return {Array} - [lng, lat, Z] or [X, Y, Z]
   */
  @autobind
  unproject(xyz, {topLeft = true} = {}) {
    this._precomputePixelProjectionMatrices();
    const [x = 0, y = 0, z = 0] = xyz;
    // const y2 = topLeft ? this.height - 1 - y : y;
    const y2 = topLeft ? this.height - y : y;
    const v = [x, y2, z, 1];
    vec4.transformMat4(v, v, this._pixelUnprojectionMatrix);
    const [x0, y0] = this.unprojectFlat(v);
    const [, , z0] = v;
    return xyz.length === 2 ? [x0, y0] : [x0, y0, z0];
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
  @autobind
  projectFlat([lng, lat], scale = this.scale) {
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
  @autobind
  unprojectFlat([x, y], scale = this.scale) {
    scale = scale * WORLD_SCALE;
    const lambda2 = x / scale - PI;
    const phi2 = 2 * (Math.atan(Math.exp(PI - y / scale)) - PI_4);
    return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
  }

  /**
   * Returns a projection matrix suitable for shaders
   * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
   */
  @autobind
  getProjectionMatrix() {
    return this._glProjectionMatrix;
  }

  @autobind
  getProjectionMatrixUncentered() {
    return this._glProjectionMatrixUncentered;
  }

  @autobind
  getUniforms() {
    return {
      projectionMatrix: this._glProjectionMatrix,
      projectionMatrixCentered: this._glProjectionMatrix,
      projectionMatrixUncentered: this._glProjectionMatrixUncentered
    };
  }

  // fitBounds(lnglatSE, lnglatNW, {padding = 0} = {}) {
  //   const bounds = new LngLatBounds(
  //     [_bounds[0].reverse(),
  //     _bounds[1].reverse()]
  //   );
  //   const offset = Point.convert([0, 0]);
  //   const nw = this.project(lnglatNW);
  //   const se = this.project(lnglatSE);
  //   const size = se.sub(nw);
  //   const scaleX =
  //     (this.width - padding * 2 - Math.abs(offset.x) * 2) / size.x;
  //   const scaleY =
  //     (this.height - padding * 2 - Math.abs(offset.y) * 2) / size.y;

  //   const center = this.unproject(nw.add(se).div(2));
  //   const zoom = this.scaleZoom(this.scale * Math.min(scaleX, scaleY));
  //   return {
  //     latitude: center.lat,
  //     longitude: center.lng,
  //     zoom
  //   };
  // }

  // INTERNAL METHODS

  /* eslint-disable max-statements */
  _initialize() {
    // Scale
    this.scale = Math.pow(2, this.zoom);
    this.worldSize = TILE_SIZE * this.scale;
    this.tileZoom = Math.floor(this.zoom);
    this.zoomFraction = this.zoom - Math.floor(this.zoom);

    // Bearing
    this.bearingRadians = this.bearing / 180 * Math.PI;
    this.bearingRotationMatrix = mat2.create();
    mat2.rotate(
      this.bearingRotationMatrix, this.bearingRotationMatrix, this.bearing
    );

    // Pitch
    this.originalPitch = this.pitch;
    this.pitch = Math.min(60, this.pitch);
    this.pitchRadians = this.pitch / 180 * Math.PI;

    // Altitude
    this.originalAltitude = this.altitude;
    this.altitude = Math.max(0.75, this.altitude);

    // Center x, y
    const y = 180 / Math.PI *
      Math.log(Math.tan(Math.PI / 4 + this.latitude * Math.PI / 360));

    this.center = this.projectFlat([this.longitude, this.latitude]);
    this.centerX = this.center[0];
    this.centerY = this.center[1];

    // Find the distance from the center point to the center top
    // in altitude units using law of sines.
    this.halfFov = Math.atan(0.5 / this.altitude);
    this.topHalfSurfaceDistance =
      Math.sin(this.halfFov) * this.altitude /
      Math.sin(Math.PI / 2 - this.pitchRadians - this.halfFov);

    // Calculate z value of the farthest fragment that should be rendered.
    this.farZ = Math.cos(Math.PI / 2 - this.pitchRadians) *
      this.topHalfSurfaceDistance + this.altitude;

    // TODO - this could be postponed until needed
    this._calculateDistanceScales();

    this._calculateGLProjectionMatrix();
    this._pixelProjectionMatrix = null;
    this._pixelUnprojectionMatrix = null;
  }
  /* eslint-enable max-statements */

  /**
   * TODO: WIP
   * Calculate distance scales in meters around current lat/lon, both for
   * degrees and pixels
   * The distance scales vary wildly with latitude
   */
  _calculateDistanceScales() {
    // Approximately 111km per degree at equator
    const METERS_PER_DEGREE = 111000;
    const {latitude: lat, longitude: lon} = this;

    const metersPerDegreeLat = Math.cos(lat / 180 * Math.PI);
    const metersPerDegreeLon = METERS_PER_DEGREE;
    const metersPerDegreeAvg = (metersPerDegreeLat + metersPerDegreeLon) / 2;

    // Calculate number of pixels occupied by one degree longitude
    // around current lat/lon, divide by number of meters per degree.
    // compensate for spherical shortening
    const pixelsPerMeterX =
      (this.project([lon + 0.5, lat]) - this.project([lon - 0.5, lat])) /
      (METERS_PER_DEGREE * Math.cos(lat / 180 * Math.PI));

    // Calculate number of pixels occupied by one degree latitude
    // around current lat/lon, divide by number of meters per degree.
    const pixelsPerMeterY =
      (this.project([lon, lat + 0.5]) - this.project([lon, lat - 0.5])) /
       METERS_PER_DEGREE;

    const pixelsPerMeterAvg = (pixelsPerMeterX + pixelsPerMeterY) / 2;

    this.metersPerLatLon = [
      metersPerDegreeLat,
      metersPerDegreeLon,
      metersPerDegreeAvg
    ];
    this.latLonPerMeter = [
      1 / metersPerDegreeLat,
      1 / metersPerDegreeLon,
      1 / metersPerDegreeAvg
    ];
    this.pixelsPerMeterX = [
      pixelsPerMeterX,
      pixelsPerMeterY,
      pixelsPerMeterAvg
    ];
    this.metersPerPixel = [
      1 / pixelsPerMeterX,
      1 / pixelsPerMeterY,
      1 / pixelsPerMeterAvg
    ];
  }

  /**
   * Builds matrices that converts preprojected lngLats to screen pixels
   * and vice versa.
   *
   * Note: Currently return bottom-left coordinates!
   * Note: Starts with the GL projection matrix and adds steps to the
   *       scale and translate that matrix onto the window.
   * Note: WebGL controls clip space to screen projection with gl.viewport
   *       and does not need this step.
   */
  _precomputePixelProjectionMatrices() {
    if (this._pixelProjectionMatrix && this._pixelUnprojectionMatrix) {
      return;
    }

    this._calculateGLProjectionMatrix()

    const m = this._createMat4();
    // Scale with viewport window's width and height in pixels
    mat4.scale(m, m, [this.width, this.height, 1]);
    // Convert to (0, 1)
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [0.5, 0.5, 0])
    // Project to clip space (-1, 1)
    mat4.multiply(m, m, this._glProjectionMatrix);
    this._pixelProjectionMatrix = m;

    const mInverse = this._createMat4();
    mat4.invert(mInverse, m);
    this._pixelUnprojectionMatrix = mInverse;
  }

  /**
   * GL clip space = [-1 - 1, -1 - 1]
   * After conversion to Float32Array this can be used as a WebGL
   * projectionMatrix
   */
  _calculateGLProjectionMatrix(m) {
    if (this._glProjectionMatrix) {
      return;
    }
    m = m || this._createMat4();

    // Note: As usual, matrix operation order should be read in reverse
    mat4.perspective(m,
      2 * Math.atan((this.height / 2) / this.altitude),
      this.width / this.height,
      0.1,
      this.farZ
    );

    // Move camera to altitude
    mat4.translate(m, m, [0, 0, -this.altitude]);

    // After the rotateX, z values are in pixel units. Convert them to
    // altitude units. 1 altitude unit = the screen height.
    mat4.scale(m, m, [1, -1, 1 / this.height]);

    // Rotate by bearing, and then by pitch (which tilts the view)
    mat4.rotateX(m, m, this.pitchRadians);
    mat4.rotateZ(m, m, -this.bearingRadians);

    // We want to be protect the dynamic range of our 32 bit matrix

    // Perform translation separately in the shader's projection function
    // mat4.translate(m, m, [-this.centerX, -this.centerY, 0]);

    // Scaling is done in shader's project function
    // mat4.scale(m, m, [this.scale, this.scale, this.scale]);

    validateMatrix(m);

    // TODO - remove
    this._glProjectionMatrixUncentered = m;

    const m2 = this._createMat4();
    // TODO - remove this step
    mat4.translate(m2, m, [-this.centerX, -this.centerY, 0]);
    this._glProjectionMatrix = m2;
  }

  // Avoid 32 bit matrices from mat4.create();
  _createMat4() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
}

function validateMatrix(m) {
  const validMatrix =
    Number.isFinite(m[0]) && Number.isFinite(m[1]) &&
    Number.isFinite(m[2]) && Number.isFinite(m[3]) &&
    Number.isFinite(m[4]) && Number.isFinite(m[5]) &&
    Number.isFinite(m[6]) && Number.isFinite(m[7]) &&
    Number.isFinite(m[8]) && Number.isFinite(m[9]) &&
    Number.isFinite(m[10]) && Number.isFinite(m[11]) &&
    Number.isFinite(m[12]) && Number.isFinite(m[13]) &&
    Number.isFinite(m[14]) && Number.isFinite(m[15]);
  assert(validMatrix, `Bad gl projection matrix ${mat4.str(m)}`);
}
