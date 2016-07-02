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

const PI = Math.PI;
const PI_2 = PI / 2;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
const WORLD_SCALE = TILE_SIZE / PI_2;

export default class Viewport {
  /* eslint-disable max-statements */
  constructor({
    // Map state
    width = 0,
    height = 0,
    latitude = 0,
    longitude = 0,
    zoom = 0,
    pitch = 0,
    bearing = 0,
    altitude = 1.5
  }) {
    // Viewport
    this.width = width;
    this.height = height;
    this.zoom = zoom;
    this.latitude = latitude;
    this.longitude = longitude;
    this.bearing = bearing;

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

    this.centerX0 = (180 + longitude) / 360 * TILE_SIZE;
    this.centerY0 = (180 - y) / 360 * TILE_SIZE;
    this.centerX = this.centerX0 * this.scale;
    this.centerY = this.centerY0 * this.scale;

    // Find the distance from the center point to the center top
    // in altitude units using law of sines.
    this.halfFov = Math.atan(0.5 / this.altitude);
    this.topHalfSurfaceDistance =
      Math.sin(this.halfFov) * this.altitude /
      Math.sin(Math.PI / 2 - this.pitchRadians - this.halfFov);

    // Calculate z value of the farthest fragment that should be rendered.
    this.farZ = Math.cos(Math.PI / 2 - this.pitchRadians) *
      this.topHalfSurfaceDistance + this.altitude;

    this._precomputeMatrices();
  }
  /* eslint-enable max-statements */

  project(lngLatZ) {
    const [x, y] = this.projectZoom0(lngLatZ);
    const v = vec4.fromValues(x, y, lngLatZ[2] || 0, 1);
    vec4.transformMat4(v, v, this.viewMatrix);
    vec4.transformMat4(v, v, this.projectionMatrix);
    // vec4.transformMat4(v, v, this.viewportMatrix);
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
  projectZoom0([lng, lat]) {
    const lambda2 = lng * DEGREES_TO_RADIANS;
    const phi2 = lat * DEGREES_TO_RADIANS;
    const x = WORLD_SCALE * (lambda2 + PI);
    const y = WORLD_SCALE * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5)));
    return [x, y];
  }

  /**
   * Unproject point {x,y} on map onto {lat, lon} on sphere
   *
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectZoom0([x, y]) {
    const lambda2 = x / WORLD_SCALE - PI;
    const phi2 = 2 * (Math.atan(Math.exp(PI - y / WORLD_SCALE)) - PI_4);
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

  _precomputeMatrices() {
    this._glProjectionMatrix = this._calculateGLProjectionMatrix();

    const m = mat4.create();
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [this.width, this.height, 1]);
    mat4.multiply(m, m, this._glProjectionMatrix);
    this._pixelProjectionMatrix = m;

    const mInverse = mat4.clone(m);
    mat4.invert(mInverse, mInverse);
  }

  // Transforms from Web Mercator Tile 0 [0-512,0-512] to "clip space"
  _calculateGLProjectionMatrix() {
    const m = mat4.create();

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

    return m;
  }

}

/* xiaoji's shader
uniform mat4 projMatrix;
uniform float zoom;
// convert (lng, lat) to screen positions in clip space.
// mapbox-gl/js/geo/transform.js
vec2 project(vec2 pt) {
  float worldSize = 512.0 * pow(2.0, zoom);
  float lngX = (180.0 + pt.x) / 360.0  * worldSize;
  float latY = (180.0 - degrees(log(tan(radians(pt.y + 90.0)/2.0)))) / 360.0
  * worldSize;
  vec4 p = vec4(lngX, latY, 0, 1.0) * projMatrix;
  return vec2(p.x/p.z, p.y/p.z);
}
*/
