//
//
// NOTE - viewport is now imported from viewport-mercator-project
// This file is no longer used and will soon be removed
//
//

// View and Projection Matrix calculations for mapbox-js style
// map view properties
//
// ATTRIBUTION:
// Projection matrix creation are intentionally kept compatible with
// mapbox-gl's implementation to ensure that seamless interoperation
// with mapbox and react-map-gl.
// See: transform.js in https://github.com/mapbox/mapbox-gl-js

// gl-matrix is a large dependency for a small module.
// However since it is used by mapbox etc, it should already be present
// in most target application bundles.
import {mat2, mat4, vec2, vec4} from 'gl-matrix';
import autobind from 'autobind-decorator';

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

// EXPORTS

export const COORDINATE_SYSTEM = {
  // Positions are interpreted as [lng,lat,elevation], distances as meters
  LNGLAT: 1.0,
  // Positions are interpreted as meter offsets, distances as meters
  METERS: 2.0,
  // Positions and distances are not transformed
  IDENTITY: 0.0
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
  /* eslint-disable complexity */
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
  /* eslint-enable complexity */

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
    const [X, Y] = this.mercatorEnabled || this.mercator ?
      this.projectFlat(lngLatZ) : lngLatZ;
    const v = [X, Y, lngLatZ[2] || 0, 1];

    // vec4.sub(v, v, [this.centerX, this.centerY, 0, 0]);
    vec4.transformMat4(v, v, this.pixelProjectionMatrix);
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
    const [x = 0, y = 0, z = 0] = xyz;
    // const y2 = topLeft ? this.height - 1 - y : y;
    const y2 = topLeft ? this.height - y : y;
    const v = [x, y2, z, 1];
    vec4.transformMat4(v, v, this.pixelUnprojectionMatrix);
    const scale = 1 / v[3];
    vec4.multiply(v, v, [scale, scale, scale, scale]);
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

  @autobind
  getProjections() {
    return {
      pixelProjectionMatrix: this.pixelProjectionMatrix,
      pixelUnprojectionMatrix: this.pixelUnprojectionMatrix,
      viewProjectionMatrix: this.viewProjectionMatrix,
      viewMatrix: this.viewMatrix,
      projectionMatrix: this.projectionMatrix
    };
  }

  @autobind
  getDistanceScales() {
    return {
      pixelsPerMeter: this.pixelsPerMeter,
      metersPerPixel: this.metersPerPixel
    };
  }

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

    // Calculate matrices and scales needed for projection
    this._calculateDistanceScales();
    this._calculateTransformationMatrices();
    this._calculateWebGLMatrices();
  }
  /* eslint-enable max-statements */

  /**
   * Calculate distance scales in meters around current lat/lon, both for
   * degrees and pixels.
   * In mercator projection mode, the distance scales vary significantly
   * with latitude.
   */
  _calculateDistanceScales() {
    // Approximately 111km per degree at equator
    const METERS_PER_DEGREE = 111000;
    const {latitude, longitude} = this;

    const latCosine = Math.cos(latitude * Math.PI / 180);

    const metersPerDegree = METERS_PER_DEGREE * latCosine;

    // Calculate number of pixels occupied by one degree longitude
    // around current lat/lon
    const pixelsPerDegreeX = vec2.distance(
      this.projectFlat([longitude + 0.5, latitude]),
      this.projectFlat([longitude - 0.5, latitude])
    );
    // Calculate number of pixels occupied by one degree latitude
    // around current lat/lon
    const pixelsPerDegreeY = vec2.distance(
      this.projectFlat([longitude, latitude + 0.5]),
      this.projectFlat([longitude, latitude - 0.5])
    );

    const pixelsPerMeterX = pixelsPerDegreeX / metersPerDegree;
    const pixelsPerMeterY = pixelsPerDegreeY / metersPerDegree;
    const pixelsPerMeterZ = (pixelsPerMeterX + pixelsPerMeterY) / 2;

    // const scale = 0.95;
    // const pixelsPerMeter = [
    //   pixelsPerMeterX * scale, pixelsPerMeterY * scale, pixelsPerMeterZ * scale
    // ];
    const altPixelsPerMeter = this.worldSize / (4e7 * latCosine);
    const pixelsPerMeter = [
      altPixelsPerMeter, altPixelsPerMeter, altPixelsPerMeter
    ];
    const metersPerPixel = [
      1 / pixelsPerMeterX, 1 / pixelsPerMeterY, 1 / pixelsPerMeterZ
    ];

    // Main results, used for scaling offsets
    this.pixelsPerMeter = pixelsPerMeter;
    // Additional results
    this.metersPerPixel = metersPerPixel;
    // metersPerDegree,
    // degreesPerMeter: 1 / metersPerDegree
  }

  // Note: As usual, matrix operation orders should be read in reverse
  // since vectors will be multiplied in from the right during transformation
  /* eslint-disable max-statements */
  _calculateTransformationMatrices() {
    // PROJECTION MATRIX: PROJECTS FROM CAMERA SPACE TO CLIPSPACE
    /* eslint-disable no-inline-comments */
    this.projectionMatrix = mat4.perspective(
      this._createMat4(),
      2 * Math.atan((this.height / 2) / this.altitude), // fov in radians
      this.width / this.height,                         // aspect ratio
      0.2,                                              // near plane
      this.farZ * 2                                     // far plane
    );
    /* eslint-enable no-inline-comments */

    // VIEW MATRIX: PROJECTS FROM VIRTUAL PIXELS TO CAMERA SPACE
    const vm = this._createMat4();

    // Move camera to altitude
    mat4.translate(vm, vm, [0, 0, -this.altitude]);

    // After the rotateX, z values are in pixel units. Convert them to
    // altitude units. 1 altitude unit = the screen height.
    mat4.scale(vm, vm, [1, -1, 1 / this.height]);

    // Rotate by bearing, and then by pitch (which tilts the view)
    mat4.rotateX(vm, vm, this.pitchRadians);
    mat4.rotateZ(vm, vm, -this.bearingRadians);

    this.viewMatrix = this._createMat4();
    mat4.translate(this.viewMatrix, vm, [-this.centerX, -this.centerY, 0]);

    const vpm = this._createMat4();
    mat4.multiply(vpm, vpm, this.projectionMatrix);
    mat4.multiply(vpm, vpm, this.viewMatrix);

    this.viewProjectionMatrix = vpm;

    // PIXEL PROJECTION MATRIX
    const m = this._createMat4();

    // Scale with viewport window's width and height in pixels
    mat4.scale(m, m, [this.width, this.height, 1]);
    // Convert to (0, 1)
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [0.5, 0.5, 0]);
    // Project to clip space (-1, 1)
    mat4.multiply(m, m, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = m;

    const mInverse = this._createMat4();
    mat4.invert(mInverse, m);
    this.pixelUnprojectionMatrix = mInverse;
  }
  /* eslint-enable max-statements */

  /**
   * Builds matrices that converts preprojected lngLats to screen pixels
   * and vice versa.
   *
   * Note: Currently returns bottom-left coordinates!
   * Note: Starts with the GL projection matrix and adds steps to the
   *       scale and translate that matrix onto the window.
   * Note: WebGL controls clip space to screen projection with gl.viewport
   *       and does not need this step.
   */
  _calculatePixelProjectionMatrices() {
    const m = this._createMat4();

    // Scale with viewport window's width and height in pixels
    mat4.scale(m, m, [this.width, this.height, 1]);
    // Convert to (0, 1)
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [0.5, 0.5, 0]);
    // Project to clip space (-1, 1)
    mat4.multiply(m, m, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = m;

    const mInverse = this._createMat4();
    mat4.invert(mInverse, m);
    this.pixelUnprojectionMatrix = mInverse;
  }

  // Helper, avoids low-precision 32 bit matrices from mat4.create();
  _createMat4() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
}
