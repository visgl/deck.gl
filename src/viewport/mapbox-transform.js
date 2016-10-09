/* eslint-disable */
// Paired down version of https://github.com/mapbox/mapbox-gl-js/blob/033043254d30a99a00b95660e296445a1ade2d01/js/geo/transform.js

import {mat2, mat4} from 'gl-matrix';

/**
 * Create a longitude, latitude object from a given longitude and latitude
 * pair in degrees.
 * Mapbox GL uses Longitude, Latitude coordinate order to match GeoJSON.
 *
 * Note that any Mapbox GL method that accepts a `LngLat` object can also
 * accept an `Array` and will perform an implicit conversion.
 * The following lines are equivalent:
 ```
 map.setCenter([-73.9749, 40.7736]);
 map.setCenter( new mapboxgl.LngLat(-73.9749, 40.7736) );
 ```
 *
 * @class LngLat
 * @classdesc A representation of a longitude, latitude point, in degrees.
 * @param {number} lng longitude
 * @param {number} lat latitude
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 */
function LngLat(lng, lat) {
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error('Invalid LngLat object: (' + lng + ', ' + lat + ')');
  }
  this.lng = Number(lng);
  this.lat = Number(lat);
  if (this.lat > 90 || this.lat < -90) {
    throw new Error('Invalid LngLat latitude value: must be between -90 and 90');
  }
}

/**
 * A single transform, generally used for a single tile to be
 * scaled, rotated, and zoomed.
 */
export default class MapboxTransform {

  /* eslint-disable max-statements */
  constructor({
    width = 0,
    height = 0,
    latitude = 0,
    longitude = 0,
    zoom = 0,
    altitude = 1.5,
    pitch = 0,
    bearing = 0
  }) {
    // constant
    this.tileSize = 512;

    this.width = 0;
    this.height = 0;
    this._center = new LngLat(0, 0);
    this.zoom = 0;
    this.angle = 0;
    this._altitude = 1.5;
    this._pitch = 0;

    this.width = width;
    this.height = height;
    this.zoom = zoom;
    this.center = new LngLat(longitude, latitude);
    this.altitude = altitude;
    this.pitch = pitch;
    this.bearing = bearing;
    this._calcProjMatrix();
  }
  /* eslint-enable */

  get worldSize() {
    return this.tileSize * this.scale;
  }

  get bearing() {
    return -this.angle / Math.PI * 180;
  }
  set bearing(bearing) {
    // TODO: Bounds check
    // var b =
    const b = -bearing * Math.PI / 180;
    if (this.angle === b) return;
    this.angle = b;

    // 2x2 matrix for rotating points
    this.rotationMatrix = mat2.create();
    mat2.rotate(this.rotationMatrix, this.rotationMatrix, this.angle);
  }

  get pitch() {
    return this._pitch / Math.PI * 180;
  }
  set pitch(pitch) {
    const p = Math.min(60, pitch) / 180 * Math.PI;
    if (this._pitch === p) return;
    this._pitch = p;
  }

  get altitude() {
    return this._altitude;
  }
  set altitude(altitude) {
    const a = Math.max(0.75, altitude);
    if (this._altitude === a) return;
    this._altitude = a;
  }

  get zoom() { return this._zoom; }
  set zoom(zoom) {
    const z = zoom;
    if (this._zoom === z) return;
    this._zoom = z;
    this.scale = this.zoomScale(z);
    this.tileZoom = Math.floor(z);
    this.zoomFraction = z - this.tileZoom;
  }

  get center() { return this._center; }
  set center(center) {
    if (center.lat === this._center.lat && center.lng === this._center.lng) return;
    this._center = center;
  }

  zoomScale(zoom) { return Math.pow(2, zoom); }

  get x() { return this.lngX(this.center.lng); }
  get y() { return this.latY(this.center.lat); }

  /**
   * latitude to absolute x coord
   * @param {number} lon
   * @param {number} [worldSize=this.worldSize]
   * @returns {number} pixel coordinate
   * @private
   */
  lngX(lng, worldSize) {
    return (180 + lng) * (worldSize || this.worldSize) / 360;
  }
  /**
   * latitude to absolute y coord
   * @param {number} lat
   * @param {number} [worldSize=this.worldSize]
   * @returns {number} pixel coordinate
   * @private
   */
  latY(lat, worldSize) {
    const y = 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    return (180 - y) * (worldSize || this.worldSize) / 360;
  }

  _calcProjMatrix() {
    const m = new Float32Array(16);

    // Find the distance from the center point to the center top in altitude units using law of sines.
    const halfFov = Math.atan(0.5 / this.altitude);
    const topHalfSurfaceDistance = Math.sin(halfFov) * this.altitude / Math.sin(Math.PI / 2 - this._pitch - halfFov);

    // Calculate z value of the farthest fragment that should be rendered.
    const farZ = Math.cos(Math.PI / 2 - this._pitch) * topHalfSurfaceDistance + this.altitude;

    mat4.perspective(m, 2 * Math.atan((this.height / 2) / this.altitude), this.width / this.height, 0.1, farZ);

    mat4.translate(m, m, [0, 0, -this.altitude]);

    // After the rotateX, z values are in pixel units. Convert them to
    // altitude units. 1 altitude unit = the screen height.
    mat4.scale(m, m, [1, -1, 1 / this.height]);

    mat4.rotateX(m, m, this._pitch);
    mat4.rotateZ(m, m, this.angle);
    mat4.translate(m, m, [-this.x, -this.y, 0]);

    this.projMatrix = m;
  }

}
