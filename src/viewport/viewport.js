// View and Projection Matrix calculations for mapbox-js style
// map view properties

/* eslint-disable max-len */
// ATTRIBUTION: Matrix creation algos are based on mapbox-gl-js source code
// This is intentionally closely mapped to mapbox-gl-js implementation to
// ensure seamless interoperation with react-map-gl
// https://github.com/mapbox/mapbox-gl-js/blob/033043254d30a99a00b95660e296445a1ade2d01/js/geo/transform.js
/* elsint-enable */

// We define a couple of coordinate systems:
// ------
// LatLon             [lng, lat] = [-180 - 180, -81 - 81]
// World (zoom 0)     [x, y] = [0-512, y: 0-512]
// Zoomed (zoom N)    [x, y] = [0 - 512*2**N, 0 - 512*2**N]
// Translated         [x, y] = zero centered
// View (Camera)      unit cube around view
// ------

import {mat2, mat4, vec4} from 'gl-matrix';
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
  /* eslint-disable max-statements */
  constructor({
    // Map state
    width,
    height,
    latitude,
    longitude,
    zoom,
    pitch,
    bearing,
    altitude
  }) {
    // Viewport - support undefined arguments
    /* eslint-disable max-len */
    this.width = width !== undefined ? width : DEFAULT_MAP_STATE.width;
    this.height = height !== undefined ? height : DEFAULT_MAP_STATE.height;
    this.zoom = zoom !== undefined ? zoom : DEFAULT_MAP_STATE.zoom;
    this.latitude = latitude !== undefined ? latitude : DEFAULT_MAP_STATE.latitude;
    this.longitude = longitude !== undefined ? longitude : DEFAULT_MAP_STATE.longitude;
    bearing = bearing !== undefined ? bearing : DEFAULT_MAP_STATE.bearing;
    pitch = pitch !== undefined ? pitch : DEFAULT_MAP_STATE.pitch;
    altitude = altitude !== undefined ? altitude : DEFAULT_MAP_STATE.altitude;
    /* eslint-enable max-len */

    // Silently allow apps to send in 0,0
    this.width = this.width || 1;
    this.height = this.height || 1;

    // Scale
    this.scale = Math.pow(2, zoom);
    this.worldSize = TILE_SIZE * this.scale;
    this.tileZoom = Math.floor(zoom);
    this.zoomFraction = zoom - Math.floor(zoom);

    // Bearing
    this.bearingRadians = bearing / 180 * Math.PI;
    this.bearingRotationMatrix = mat2.create();
    mat2.rotate(
      this.bearingRotationMatrix, this.bearingRotationMatrix, this.bearing
    );

    // Pitch
    this.originalPitch = pitch;
    this.pitch = Math.min(60, pitch);
    this.pitchRadians = Math.min(60, pitch) / 180 * Math.PI;

    // Altitude
    this.originalAltitude = altitude;
    this.altitude = Math.max(0.75, altitude);

    // Center x, y
    const y = 180 / Math.PI *
      Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360));

    this.center = this.projectToWorld([longitude, latitude]);
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

    this._glProjectionMatrix = this._calculateGLProjectionMatrix();
    this._pixelProjectionMatrix = null;
    this._pixelUnprojectionMatrix = null;

    Object.seal(this);
  }
  /* eslint-enable max-statements */

  project(lngLatZ) {
    this._precomputePixelProjectionMatrices();
    const [x, y] = this.projectToWorld(lngLatZ);
    const v = [x, y, lngLatZ[2] || 0, 1];
    // vec4.sub(v, v, [this.centerX, this.centerY, 0, 0]);
    vec4.transformMat4(v, v, this._pixelProjectionMatrix);
    // Divide by w
    const scale = 1 / v[3];
    vec4.multiply(v, v, [scale, scale, scale, scale]);
    return v;
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
  projectToWorld([lng, lat], scale = this.scale) {
    scale = scale * WORLD_SCALE;
    const lambda2 = lng * DEGREES_TO_RADIANS;
    const phi2 = lat * DEGREES_TO_RADIANS;
    const x = scale * (lambda2 + PI);
    const y = scale * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5)));
    return [x, y];
  }

  /**
   * Unproject pixel point [x,y] on map onto {lat, lon} on sphere
   *
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unproject([x, y]) {
    this._precomputePixelProjectionMatrices();
    const v = [x, y, 0, 1];
    vec4.transformMat4(v, v, this._pixelUnprojectionMatrix);
    return v;
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
  unprojectToWorld([x, y], scale = this.scale) {
    scale = scale * WORLD_SCALE;
    const lambda2 = x / scale - PI;
    const phi2 = 2 * (Math.atan(Math.exp(PI - y / scale)) - PI_4);
    return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
  }

  getProjectionMatrix() {
    return this._glProjectionMatrix;
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

  // Calculate distance scales in meters around current lat/lon, both for
  // degrees and pixels
  // The distance scales vary wildly with latitude
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

  _precomputePixelProjectionMatrices() {
    if (this._pixelProjectionMatrix && this._pixelUnprojectionMatrix) {
      return;
    }

    // const glProjectionMatrix = this._glProjectionMatrix;
    const glProjectionMatrix =
      this._calculateGLProjectionMatrix(this._createMat4())

    const m = this._createMat4();
    // Scale with pixel width and height
    mat4.scale(m, m, [this.width, this.height, 1]);
    // Convert to (0, 1)
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [0.5, 0.5, 0])
    // Project to clip space (-1, 1)
    mat4.multiply(m, m, glProjectionMatrix);
    this._pixelProjectionMatrix = m;

    const mInverse = mat4.clone(m);
    mat4.invert(mInverse, mInverse);
    this._pixelUnprojectionMatrix = mInverse;
  }

  // Transforms from Web Mercator Tile 0 [0-512,0-512] to "clip space"
  _calculateGLProjectionMatrix(m) {
    m = m || mat4.create();

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

    mat4.rotateX(m, m, this.pitchRadians);
    mat4.rotateZ(m, m, -this.bearingRadians);
    mat4.translate(m, m, [-this.centerX, -this.centerY, 0]);
    // mat4.scale(m, m, [this.scale, this.scale, this.scale]);

    validateMatrix(m);

    return m;
  }

  _createMat4() {
    // return mat4.create();
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

}

// TODO - move to luma math library
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
