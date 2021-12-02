// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import log from '../utils/log';
import {createMat4, getCameraPosition, getFrustumPlanes} from '../utils/math-utils';

import {Matrix4, Vector3, equals} from '@math.gl/core';
import * as mat4 from 'gl-matrix/mat4';

import {
  getDistanceScales,
  getMeterZoom,
  lngLatToWorld,
  worldToLngLat,
  worldToPixels,
  pixelsToWorld
} from '@math.gl/web-mercator';

import {PROJECTION_MODE} from '../lib/constants';

const DEGREES_TO_RADIANS = Math.PI / 180;

const IDENTITY = createMat4();

const ZERO_VECTOR = [0, 0, 0];

const DEFAULT_ZOOM = 0;

const DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};

export default class Viewport {
  /**
   * @classdesc
   * Manages coordinate system transformations for deck.gl.
   *
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  constructor(opts = {}) {
    const {
      id = null,
      // Window width/height in pixels (for pixel projection)
      x = 0,
      y = 0,
      width = 1,
      height = 1
    } = opts;

    this.id = id || this.constructor.displayName || 'viewport';

    this.x = x;
    this.y = y;
    // Silently allow apps to send in w,h = 0,0
    this.width = width || 1;
    this.height = height || 1;
    this._frustumPlanes = {};

    this._initViewMatrix(opts);
    this._initProjectionMatrix(opts);
    this._initPixelMatrices();

    // Bind methods for easy access
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }

  get metersPerPixel() {
    return this.distanceScales.metersPerUnit[2] / this.scale;
  }

  get projectionMode() {
    if (this.isGeospatial) {
      return this.zoom < 12
        ? PROJECTION_MODE.WEB_MERCATOR
        : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
    }
    return PROJECTION_MODE.IDENTITY;
  }

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.
  equals(viewport) {
    if (!(viewport instanceof Viewport)) {
      return false;
    }
    if (this === viewport) {
      return true;
    }

    return (
      viewport.width === this.width &&
      viewport.height === this.height &&
      viewport.scale === this.scale &&
      equals(viewport.projectionMatrix, this.projectionMatrix) &&
      equals(viewport.viewMatrix, this.viewMatrix)
    );
    // TODO - check distance scales?
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
  project(xyz, {topLeft = true} = {}) {
    const worldPosition = this.projectPosition(xyz);
    const coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

    const [x, y] = coord;
    const y2 = topLeft ? y : this.height - y;
    return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
  }

  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(xyz, {topLeft = true, targetZ} = {}) {
    const [x, y, z] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
    const coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }

  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection

  projectPosition(xyz) {
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
    return [X, Y, Z];
  }

  unprojectPosition(xyz) {
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
    return [X, Y, Z];
  }

  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */
  projectFlat(xyz) {
    if (this.isGeospatial) {
      return lngLatToWorld(xyz);
    }
    return xyz;
  }

  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectFlat(xyz) {
    if (this.isGeospatial) {
      return worldToLngLat(xyz);
    }
    return xyz;
  }

  getBounds(options = {}) {
    const unprojectOption = {targetZ: options.z || 0};

    const topLeft = this.unproject([0, 0], unprojectOption);
    const topRight = this.unproject([this.width, 0], unprojectOption);
    const bottomLeft = this.unproject([0, this.height], unprojectOption);
    const bottomRight = this.unproject([this.width, this.height], unprojectOption);

    return [
      Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
    ];
  }

  getDistanceScales(coordinateOrigin = null) {
    if (coordinateOrigin) {
      return getDistanceScales({
        longitude: coordinateOrigin[0],
        latitude: coordinateOrigin[1],
        highPrecision: true
      });
    }
    return this.distanceScales;
  }

  containsPixel({x, y, width = 1, height = 1}) {
    return (
      x < this.x + this.width &&
      this.x < x + width &&
      y < this.y + this.height &&
      this.y < y + height
    );
  }

  // Extract frustum planes in common space
  getFrustumPlanes() {
    if (this._frustumPlanes.near) {
      return this._frustumPlanes;
    }

    Object.assign(this._frustumPlanes, getFrustumPlanes(this.viewProjectionMatrix));

    return this._frustumPlanes;
  }

  // EXPERIMENTAL METHODS

  /**
   * Needed by panning and linear transition
   * Pan the viewport to place a given world coordinate at screen point [x, y]
   *
   * @param {Array} coords - world coordinates
   * @param {Array} pixel - [x,y] coordinates on screen
   * @return {Object} props of the new viewport
   */
  panByPosition(coords, pixel) {
    return null;
  }

  getCameraPosition() {
    return this.cameraPosition;
  }

  getCameraDirection() {
    return this.cameraDirection;
  }

  getCameraUp() {
    return this.cameraUp;
  }

  // INTERNAL METHODS

  _createProjectionMatrix({orthographic, fovyRadians, aspect, focalDistance, near, far}) {
    return orthographic
      ? new Matrix4().orthographic({fovy: fovyRadians, aspect, focalDistance, near, far})
      : new Matrix4().perspective({fovy: fovyRadians, aspect, near, far});
  }

  /* eslint-disable complexity, max-statements */
  _initViewMatrix(opts) {
    const {
      // view matrix
      viewMatrix = IDENTITY,

      longitude = null, // Anchor: lng lat zoom makes viewport work w/ geospatial coordinate systems
      latitude = null,
      zoom = null,

      position = null, // Anchor position offset (in meters for geospatial viewports)
      modelMatrix = null, // A model matrix to be applied to position, to match the layer props API
      focalDistance = 1, // Only needed for orthographic views

      distanceScales = null
    } = opts;

    // Check if we have a geospatial anchor
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);

    this.zoom = zoom;
    if (!Number.isFinite(this.zoom)) {
      this.zoom = this.isGeospatial
        ? getMeterZoom({latitude}) + Math.log2(focalDistance)
        : DEFAULT_ZOOM;
    }
    const scale = Math.pow(2, this.zoom);
    this.scale = scale;

    // Calculate distance scales if lng/lat/zoom are provided
    this.distanceScales = this.isGeospatial
      ? getDistanceScales({latitude, longitude})
      : distanceScales || DEFAULT_DISTANCE_SCALES;

    this.focalDistance = focalDistance;

    this.distanceScales.metersPerUnit = new Vector3(this.distanceScales.metersPerUnit);
    this.distanceScales.unitsPerMeter = new Vector3(this.distanceScales.unitsPerMeter);

    this.position = ZERO_VECTOR;
    this.meterOffset = ZERO_VECTOR;
    if (position) {
      // Apply model matrix if supplied
      this.position = position;
      this.modelMatrix = modelMatrix;
      this.meterOffset = modelMatrix ? modelMatrix.transformVector(position) : position;
    }

    if (this.isGeospatial) {
      // Determine camera center
      this.longitude = longitude;
      this.latitude = latitude;
      this.center = this._getCenterInWorld({longitude, latitude});
    } else {
      this.center = position ? this.projectPosition(position) : [0, 0, 0];
    }
    this.viewMatrixUncentered = viewMatrix;
    // Make a centered version of the matrix for projection modes without an offset
    this.viewMatrix = new Matrix4()
      // Apply the uncentered view matrix
      .multiplyRight(this.viewMatrixUncentered)
      // And center it
      .translate(new Vector3(this.center || ZERO_VECTOR).negate());
  }
  /* eslint-enable complexity, max-statements */

  _getCenterInWorld({longitude, latitude}) {
    const {meterOffset, distanceScales} = this;

    // Make a centered version of the matrix for projection modes without an offset
    const center = new Vector3(this.projectPosition([longitude, latitude, 0]));

    if (meterOffset) {
      const commonPosition = new Vector3(meterOffset)
        // Convert to pixels in current zoom
        .scale(distanceScales.unitsPerMeter);
      center.add(commonPosition);
    }

    return center;
  }

  _initProjectionMatrix(opts) {
    const {
      // Projection matrix
      projectionMatrix = null,

      // Projection matrix parameters, used if projectionMatrix not supplied
      orthographic = false,
      fovyRadians,
      fovy = 75,
      near = 0.1, // Distance of near clipping plane
      far = 1000, // Distance of far clipping plane
      focalDistance = 1
    } = opts;

    this.projectionMatrix =
      projectionMatrix ||
      this._createProjectionMatrix({
        orthographic,
        fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS,
        aspect: this.width / this.height,
        focalDistance,
        near,
        far
      });
  }

  _initPixelMatrices() {
    // Note: As usual, matrix operations should be applied in "reverse" order
    // since vectors will be multiplied in from the right during transformation
    const vpm = createMat4();
    mat4.multiply(vpm, vpm, this.projectionMatrix);
    mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;

    // console.log('VPM', this.viewMatrix, this.projectionMatrix, this.viewProjectionMatrix);

    // Calculate inverse view matrix
    this.viewMatrixInverse = mat4.invert([], this.viewMatrix) || this.viewMatrix;

    // Decompose camera parameters
    this.cameraPosition = getCameraPosition(this.viewMatrixInverse);

    /*
     * Builds matrices that converts preprojected lngLats to screen pixels
     * and vice versa.
     * Note: Currently returns bottom-left coordinates!
     * Note: Starts with the GL projection matrix and adds steps to the
     *       scale and translate that matrix onto the window.
     * Note: WebGL controls clip space to screen projection with gl.viewport
     *       and does not need this step.
     */

    // matrix for conversion from world location to screen (pixel) coordinates
    const viewportMatrix = createMat4(); // matrix from NDC to viewport.
    const pixelProjectionMatrix = createMat4(); // matrix from world space to viewport.
    mat4.scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
    mat4.translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
    mat4.multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = pixelProjectionMatrix;
    this.viewportMatrix = viewportMatrix;

    this.pixelUnprojectionMatrix = mat4.invert(createMat4(), this.pixelProjectionMatrix);
    if (!this.pixelUnprojectionMatrix) {
      log.warn('Pixel project matrix not invertible')();
      // throw new Error('Pixel project matrix not invertible');
    }
  }
}

Viewport.displayName = 'Viewport';
