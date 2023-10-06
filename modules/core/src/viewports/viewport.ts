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
import {createMat4, getCameraPosition, getFrustumPlanes, FrustumPlane} from '../utils/math-utils';

import {Matrix4, Vector3, equals, clamp} from '@math.gl/core';
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

export type DistanceScales = {
  unitsPerMeter: number[];
  metersPerUnit: number[];
};

export type Padding = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

export type ViewportOptions = {
  /** Name of the viewport */
  id?: string;
  /** Left offset from the canvas edge, in pixels */
  x?: number;
  /** Top offset from the canvas edge, in pixels */
  y?: number;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** Longitude in degrees (geospatial only) */
  longitude?: number;
  /** Latitude in degrees (geospatial only) */
  latitude?: number;
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  distanceScales?: DistanceScales;
  /** Model matrix of viewport center */
  modelMatrix?: number[] | null;
  /** Custom view matrix */
  viewMatrix?: number[];
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Modifier of viewport scale. Corresponds to the number of pixels per common unit at zoom 0. */
  focalDistance?: number;
  /** Use orthographic projection */
  orthographic?: boolean;
  /** fovy in radians. If supplied, overrides fovy */
  fovyRadians?: number;
  /** fovy in degrees. */
  fovy?: number;
  /** Near plane of the projection matrix */
  near?: number;
  /** Far plane of the projection matrix */
  far?: number;
};

const DEGREES_TO_RADIANS = Math.PI / 180;

const IDENTITY = createMat4();

const ZERO_VECTOR = [0, 0, 0];

const DEFAULT_DISTANCE_SCALES: DistanceScales = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};

// / Helpers
function createProjectionMatrix({
  width,
  height,
  orthographic,
  fovyRadians,
  focalDistance,
  padding,
  near,
  far
}: {
  width: number;
  height: number;
  orthographic: boolean;
  fovyRadians: number;
  focalDistance: number;
  padding: Padding | null;
  near: number;
  far: number;
}) {
  const aspect = width / height;
  const matrix = orthographic
    ? new Matrix4().orthographic({fovy: fovyRadians, aspect, focalDistance, near, far})
    : new Matrix4().perspective({fovy: fovyRadians, aspect, near, far});
  if (padding) {
    const {left = 0, right = 0, top = 0, bottom = 0} = padding;
    const offsetX = clamp((left + width - right) / 2, 0, width) - width / 2;
    const offsetY = clamp((top + height - bottom) / 2, 0, height) - height / 2;
    // pixels to clip space
    matrix[8] -= (offsetX * 2) / width;
    matrix[9] += (offsetY * 2) / height;
  }
  return matrix;
}

/**
 * Manages coordinate system transformations.
 *
 * Note: The Viewport is immutable in the sense that it only has accessors.
 * A new viewport instance should be created if any parameters have changed.
 */
export default class Viewport {
  static displayName = 'Viewport';

  /** Init parameters */

  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: Padding | null;
  isGeospatial: boolean;
  zoom: number;
  focalDistance: number;
  position: number[];
  modelMatrix: number[] | null;

  /** Derived parameters */

  // `!` post-fix expression operator asserts that its operand is non-null and non-undefined in contexts
  // where the type checker is unable to conclude that fact.

  distanceScales: DistanceScales; /** scale factors between world space and common space */
  scale!: number; /** scale factor, equals 2^zoom */
  center!: number[]; /** viewport center in common space */
  cameraPosition!: number[]; /** Camera position in common space */
  projectionMatrix!: number[];
  viewMatrix!: number[];
  viewMatrixUncentered!: number[];
  viewMatrixInverse!: number[];
  viewProjectionMatrix!: number[];
  pixelProjectionMatrix!: number[];
  pixelUnprojectionMatrix!: number[];
  resolution?: number;

  private _frustumPlanes: {[name: string]: FrustumPlane} = {};

  // eslint-disable-next-line complexity
  constructor(opts: ViewportOptions = {}) {
    // @ts-ignore
    this.id = opts.id || this.constructor.displayName || 'viewport';

    this.x = opts.x || 0;
    this.y = opts.y || 0;
    // Silently allow apps to send in w,h = 0,0
    this.width = opts.width || 1;
    this.height = opts.height || 1;
    this.zoom = opts.zoom || 0;
    this.padding = opts.padding;
    this.distanceScales = opts.distanceScales || DEFAULT_DISTANCE_SCALES;
    this.focalDistance = opts.focalDistance || 1;
    this.position = opts.position || ZERO_VECTOR;
    this.modelMatrix = opts.modelMatrix || null;

    const {longitude, latitude} = opts;
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);

    this._initProps(opts);
    this._initMatrices(opts);

    // Bind methods for easy access
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }

  get subViewports(): Viewport[] | null {
    return null;
  }

  get metersPerPixel(): number {
    return this.distanceScales.metersPerUnit[2] / this.scale;
  }

  get projectionMode(): number {
    if (this.isGeospatial) {
      return this.zoom < 12
        ? PROJECTION_MODE.WEB_MERCATOR
        : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
    }
    return PROJECTION_MODE.IDENTITY;
  }

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.
  equals(viewport: Viewport): boolean {
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
  project(xyz: number[], {topLeft = true}: {topLeft?: boolean} = {}): number[] {
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
  unproject(
    xyz: number[],
    {topLeft = true, targetZ}: {topLeft?: boolean; targetZ?: number} = {}
  ): number[] {
    const [x, y, z] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
    const coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ as number] : [X, Y];
  }

  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection

  projectPosition(xyz: number[]): [number, number, number] {
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
    return [X, Y, Z];
  }

  unprojectPosition(xyz: number[]): [number, number, number] {
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
  projectFlat(xyz: number[]): [number, number] {
    if (this.isGeospatial) {
      // Shader clamps latitude to +-89.9, see /shaderlib/project/project.glsl.js
      // lngLatToWorld([0, -89.9])[1] = -317.9934163758329
      // lngLatToWorld([0, 89.9])[1] = 829.9934163758271
      const result = lngLatToWorld(xyz);
      result[1] = clamp(result[1], -318, 830);
      return result;
    }
    return xyz as [number, number];
  }

  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectFlat(xyz: number[]): [number, number] {
    if (this.isGeospatial) {
      return worldToLngLat(xyz);
    }
    return xyz as [number, number];
  }

  /**
   * Get bounds of the current viewport
   * @return {Array} - [minX, minY, maxX, maxY]
   */
  getBounds(options: {z?: number} = {}): [number, number, number, number] {
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

  getDistanceScales(coordinateOrigin?: number[]): DistanceScales {
    if (coordinateOrigin) {
      return getDistanceScales({
        longitude: coordinateOrigin[0],
        latitude: coordinateOrigin[1],
        highPrecision: true
      });
    }
    return this.distanceScales;
  }

  containsPixel({
    x,
    y,
    width = 1,
    height = 1
  }: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }): boolean {
    return (
      x < this.x + this.width &&
      this.x < x + width &&
      y < this.y + this.height &&
      this.y < y + height
    );
  }

  // Extract frustum planes in common space
  getFrustumPlanes(): {
    left: FrustumPlane;
    right: FrustumPlane;
    bottom: FrustumPlane;
    top: FrustumPlane;
    near: FrustumPlane;
    far: FrustumPlane;
  } {
    if (this._frustumPlanes.near) {
      // @ts-ignore
      return this._frustumPlanes;
    }

    Object.assign(this._frustumPlanes, getFrustumPlanes(this.viewProjectionMatrix));

    // @ts-ignore
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
  panByPosition(coords: number[], pixel: number[]): any {
    return null;
  }

  // INTERNAL METHODS

  /* eslint-disable complexity, max-statements */
  private _initProps(opts: ViewportOptions) {
    const longitude = opts.longitude as number;
    const latitude = opts.latitude as number;

    if (this.isGeospatial) {
      if (!Number.isFinite(opts.zoom)) {
        this.zoom = getMeterZoom({latitude}) + Math.log2(this.focalDistance);
      }
      this.distanceScales = opts.distanceScales || getDistanceScales({latitude, longitude});
    }
    const scale = Math.pow(2, this.zoom);
    this.scale = scale;

    const {position, modelMatrix} = opts;
    let meterOffset: number[] = ZERO_VECTOR;
    if (position) {
      meterOffset = modelMatrix
        ? (new Matrix4(modelMatrix).transformAsVector(position, []) as number[])
        : position;
    }

    if (this.isGeospatial) {
      // Determine camera center in common space
      const center = this.projectPosition([longitude, latitude, 0]);

      this.center = new Vector3(meterOffset)
        // Convert to pixels in current zoom
        .scale(this.distanceScales.unitsPerMeter)
        .add(center);
    } else {
      this.center = this.projectPosition(meterOffset);
    }
  }
  /* eslint-enable complexity, max-statements */

  private _initMatrices(opts: ViewportOptions) {
    const {
      // View matrix
      viewMatrix = IDENTITY,
      // Projection matrix
      projectionMatrix = null,

      // Projection matrix parameters, used if projectionMatrix not supplied
      orthographic = false,
      fovyRadians,
      fovy = 75,
      near = 0.1, // Distance of near clipping plane
      far = 1000, // Distance of far clipping plane
      padding = null, // Center offset in pixels
      focalDistance = 1
    } = opts;

    this.viewMatrixUncentered = viewMatrix;
    // Make a centered version of the matrix for projection modes without an offset
    this.viewMatrix = new Matrix4()
      // Apply the uncentered view matrix
      .multiplyRight(viewMatrix)
      // And center it
      .translate(new Vector3(this.center).negate());

    this.projectionMatrix =
      projectionMatrix ||
      createProjectionMatrix({
        width: this.width,
        height: this.height,
        orthographic,
        fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS,
        focalDistance,
        padding,
        near,
        far
      });

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

    this.pixelUnprojectionMatrix = mat4.invert(createMat4(), this.pixelProjectionMatrix);
    if (!this.pixelUnprojectionMatrix) {
      log.warn('Pixel project matrix not invertible')();
      // throw new Error('Pixel project matrix not invertible');
    }
  }
}
