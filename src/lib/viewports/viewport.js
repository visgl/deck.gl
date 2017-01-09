// View and Projection Matrix management

// gl-matrix is a large dependency for a small module.
// However since it is used by mapbox etc, it should already be present
// in most target application bundles.
import {mat4, vec4} from 'gl-matrix';
import autobind from 'autobind-decorator';

const IDENTITY = createMat4();

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
   */
  /* eslint-disable complexity */
  constructor({
    // Window width/height in pixels (for pixel projection)
    width = 1,
    height = 1,
    // Desc
    viewMatrix = IDENTITY,
    projectionMatrix = IDENTITY
  } = {}) {
    // Silently allow apps to send in 0,0
    this.width = width || 1;
    this.height = height || 1;
    this.scale = 1;

    this.viewMatrix = viewMatrix;
    this.projectionMatrix = projectionMatrix;

    // Note: As usual, matrix operations should be applied in "reverse" order
    // since vectors will be multiplied in from the right during transformation
    const vpm = createMat4();
    mat4.multiply(vpm, vpm, this.projectionMatrix);
    mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;

    // Calculate matrices and scales needed for projection
    /**
     * Builds matrices that converts preprojected lngLats to screen pixels
     * and vice versa.
     * Note: Currently returns bottom-left coordinates!
     * Note: Starts with the GL projection matrix and adds steps to the
     *       scale and translate that matrix onto the window.
     * Note: WebGL controls clip space to screen projection with gl.viewport
     *       and does not need this step.
     */
    const m = createMat4();

    // Scale with viewport window's width and height in pixels
    mat4.scale(m, m, [this.width, this.height, 1]);
    // Convert to (0, 1)
    mat4.translate(m, m, [0.5, 0.5, 0]);
    mat4.scale(m, m, [0.5, 0.5, 1]);
    // Project to clip space (-1, 1)
    mat4.multiply(m, m, this.viewProjectionMatrix);

    const mInverse = mat4.invert(createMat4(), m);
    if (!mInverse) {
      throw new Error('Pixel project matrix not invertible');
    }

    this.pixelProjectionMatrix = m;
    this.pixelUnprojectionMatrix = mInverse;
  }
  /* eslint-enable complexity */

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.
  equals(viewport) {
    if (!(viewport instanceof Viewport)) {
      return false;
    }

    return viewport.width === this.width &&
      viewport.height === this.height &&
      mat4.equals(viewport.projectionMatrix, this.projectionMatrix) &&
      mat4.equals(viewport.viewMatrix, this.viewMatrix);
  }

  /**
   * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
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
  @autobind project(xyz, {topLeft = false} = {}) {
    const Z = xyz[2] || 0;
    // console.error('projecting non-linear', xyz);
    const [X, Y] = this.projectFlat(xyz);
    const v = [X, Y, Z, 1];
    // console.error('projecting linear', v);
    // vec4.sub(v, v, [this.centerX, this.centerY, 0, 0]);
    vec4.transformMat4(v, v, this.pixelProjectionMatrix);
    // Divide by w
    const scale = 1 / v[3];
    vec4.multiply(v, v, [scale, scale, scale, scale]);
    // console.error('projected', v);
    const [x, , z] = v;
    const y = topLeft ? this.height - v[1] : v[1];
    return xyz.length === 2 ? [x, y] : [x, y, z];
  }

  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @return {Array} - [lng, lat, Z] or [X, Y, Z]
   */
  @autobind unproject(xyz, {topLeft = false} = {}) {
    // console.error('unprojecting linear', xyz);
    const [x = 0, y = 0, z = 0] = xyz;
    // const y2 = topLeft ? this.height - 1 - y : y;
    const y2 = topLeft ? this.height - y : y;
    const v = [x, y2, z, 1];
    vec4.transformMat4(v, v, this.pixelUnprojectionMatrix);
    const scale = 1 / v[3];
    vec4.multiply(v, v, [scale, scale, scale, scale]);
    // console.error('unprojecting non-linear', v);
    const [x0, y0] = this.unprojectFlat(v);
    // console.error('unprojected', [x0, y0]);
    const [, , z0] = v;
    return xyz.length === 2 ? [x0, y0] : [x0, y0, z0];
  }

  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection

  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */
  @autobind projectFlat([x, y], scale = this.scale) {
    return this._projectFlat(...arguments);
  }

  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  @autobind unprojectFlat(xyz, scale = this.scale) {
    return this._unprojectFlat(...arguments);
  }

  // _projectFlat(xyz, scale = this.scale) {
  //   return xyz;
  // }

  // _unprojectFlat(xyz, scale = this.scale) {
  //   return xyz;
  // }

  @autobind getMatrices({modelMatrix = null, ...opts} = {}) {
    let modelViewProjectionMatrix = this.viewProjectionMatrix;
    let pixelProjectionMatrix = this.pixelProjectionMatrix;
    let pixelUnprojectionMatrix = this.pixelUnprojectionMatrix;

    if (modelMatrix) {
      modelViewProjectionMatrix = mat4.multiply([], this.viewProjectionMatrix, modelMatrix);
      pixelProjectionMatrix = mat4.multiply([], this.pixelProjectionMatrix, modelMatrix);
      pixelUnprojectionMatrix = mat4.invert([], pixelProjectionMatrix);
    }

    const matrices = {
      modelViewProjectionMatrix,
      viewProjectionMatrix: this.viewProjectionMatrix,
      viewMatrix: this.viewMatrix,
      projectionMatrix: this.projectionMatrix,

      // project/unproject between pixels and world
      pixelProjectionMatrix,
      pixelUnprojectionMatrix,

      width: this.width,
      height: this.height,
      scale: this.scale,

      // Subclass can add additional params
      // TODO - Fragile: better to make base Viewport class aware of all params
      ...this._getParams()
    };

    return matrices;
  }

  // INTERNAL METHODS

  // Can be subclassed to add additional fields to `getMatrices`
  _getParams() {
    return {};
  }
}

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
