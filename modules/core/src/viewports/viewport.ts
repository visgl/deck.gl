// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {CRSDescriptor} from '@math.gl/projection/core';
import log from '../utils/log';
import assert from '../utils/assert';
import {WGS84_CRS} from '../utils/crs';
import {supportsSourceCRS} from '../shaderlib/project/coordinate-systems';
import {
  createMat4,
  getCameraPosition,
  getFrustumPlanes,
  FrustumPlane,
  worldToPixels,
  pixelsToWorld
} from '../utils/math-utils';

import {Matrix4, Vector3, equals, clamp} from '@math.gl/core';
import * as mat4 from '@math.gl/core/mat4';

import {PROJECTION_MODE} from '../shaderlib/project/constants';

export type ProjectPositionOptions = {
  /** CRS of the input coordinates. Defaults to WGS84 for geospatial viewports. */
  sourceCrs?: CRSDescriptor;
};

export type DistanceScales = {
  /** Local scale from position units to common units (after preprojection, if applicable). */
  unitsPerWorldUnit: [number, number, number];
  /** Local scale from ground meters to common units. */
  unitsPerMeter: [number, number, number];
  /** Reciprocal of unitsPerMeter, derived when the viewport is constructed. */
  metersPerUnit: [number, number, number];
  /** Latitude-dependent correction to unitsPerWorldUnit; zero for linear projections. */
  unitsPerWorldUnit2: [number, number, number];
  /** Latitude-dependent correction to unitsPerMeter; zero for linear projections. */
  unitsPerMeter2: [number, number, number];
};

export type Padding = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

export type ViewportOptions = {
  /** Prepared target CRS descriptor; resolution belongs to the View. */
  crs?: CRSDescriptor;
  /** Subdivision intervals around the earth. Default 0 disables subdivision. */
  resolution?: number;
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
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat, elevation */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  /** Partial scales, or a sampler in the viewport's world coordinates.
   * Omitted scales are defaulted and metersPerUnit is always derived.
   */
  distanceScales?:
    | Partial<DistanceScales>
    | ((coordinateOrigin?: number[]) => Partial<DistanceScales>);
  /** Affine target-CRS-to-common transform, replacing unitsPerWorldUnit scaling for CRS conversion.
   * Elevation-plane unprojection requires horizontal planes to remain horizontal.
   */
  targetToCommonMatrix?: number[];
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

function normalizeDistanceScales(scales: Partial<DistanceScales> = {}): DistanceScales {
  const unitsPerWorldUnit: [number, number, number] = scales.unitsPerWorldUnit ?? [1, 1, 1];
  const unitsPerMeter = scales.unitsPerMeter ?? unitsPerWorldUnit;
  return {
    unitsPerWorldUnit,
    unitsPerMeter,
    unitsPerWorldUnit2: scales.unitsPerWorldUnit2 ?? [0, 0, 0],
    unitsPerMeter2: scales.unitsPerMeter2 ?? [0, 0, 0],
    metersPerUnit: [1 / unitsPerMeter[0], 1 / unitsPerMeter[1], 1 / unitsPerMeter[2]]
  };
}

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
  /** Prepared target CRS descriptor; absent for an unreferenced viewport. */
  crs?: CRSDescriptor;
  /** Affine target-CRS-to-common transform, if common space uses another axis convention. */
  targetToCommonMatrix?: Matrix4;
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
  /** Subdivision intervals around the earth; zero disables subdivision. */
  readonly resolution: number;
  /** Viewport tessellation/preprojection configuration; layer source CRS is tracked separately. */
  get projectionSignature(): unknown {
    return this.resolution || null;
  }

  /** Return the subdivision step in source CRS world units, or zero for a linear/disabled path.
   * Derives an equatorial interval from the source ellipsoid circumference divided by resolution.
   * Geographic steps are in degrees; linear steps use CRS axis units.
   */
  getSubdivisionStep(sourceCrs: CRSDescriptor): number {
    if (!this.resolution || !this.crs || sourceCrs.signature === this.crs.signature) {
      return 0;
    }
    switch (this.projectionMode) {
      case PROJECTION_MODE.WEB_MERCATOR:
      case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
        // Mercator retains its straight-segment rendering of geographic attributes.
        if (sourceCrs.coordinateFrame === 'geographic') return 0;
        break;
    }
    const radius = sourceCrs.ellipsoid?.semiMajorAxis ?? WGS84_CRS.ellipsoid!.semiMajorAxis;
    const meters = (2 * Math.PI * radius) / this.resolution;
    switch (sourceCrs.coordinateFrame) {
      case 'geographic':
        return meters / ((radius * Math.PI) / 180);
      default: {
        const x = sourceCrs.xUnit.metersPerUnit;
        const y = sourceCrs.yUnit.metersPerUnit;
        // Non-geographic descriptors must supply linear units for subdivision.
        assert(typeof x === 'number' && x > 0 && typeof y === 'number' && y > 0);
        return meters / Math.max(x, y);
      }
    }
  }

  /** Prepare conversion between a source CRS and the coordinates accepted by the project shader. */
  getPreprojection(sourceCrs: CRSDescriptor | null): {
    preproject: ((position: number[]) => [number, number, number]) | null;
    unpreproject: ((position: number[]) => [number, number, number]) | null;
    packedCrs: CRSDescriptor | null;
  } {
    if (supportsSourceCRS(this.projectionMode, sourceCrs, this.crs)) {
      return {preproject: null, unpreproject: null, packedCrs: sourceCrs};
    }
    const custom = this.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL;
    const geographic = sourceCrs!.signature === 'WGS84';
    const sourceConverter = sourceCrs!.converter.WGS84;
    const targetConverter = custom ? this.crs!.converter.WGS84 : null;
    return {
      preproject: position => {
        const wgs84 = geographic ? position : sourceConverter.to(position);
        const packed = targetConverter
          ? targetConverter.from(targetConverter.normalize(wgs84))
          : wgs84;
        return [packed[0], packed[1], packed[2] ?? 0];
      },
      unpreproject: position => {
        const wgs84 = targetConverter ? targetConverter.to(position) : position;
        const source = geographic ? wgs84 : sourceConverter.from(wgs84);
        return [source[0], source[1], source[2] ?? 0];
      },
      packedCrs: custom ? this.crs! : WGS84_CRS
    };
  }

  private _commonToTargetMatrix?: Matrix4;
  private _distanceScaleSampler?: (coordinateOrigin?: number[]) => Partial<DistanceScales>;
  private _frustumPlanes: {[name: string]: FrustumPlane} = {};

  // eslint-disable-next-line complexity
  constructor(opts: ViewportOptions = {}) {
    this.resolution = opts.resolution ?? 0;
    if (!Number.isFinite(this.resolution) || this.resolution < 0) {
      throw new Error('resolution must be finite and non-negative');
    }
    this.crs = opts.crs;
    if (opts.targetToCommonMatrix) {
      this.targetToCommonMatrix = new Matrix4(opts.targetToCommonMatrix);
      this._commonToTargetMatrix = new Matrix4(this.targetToCommonMatrix).invert();
    }
    this._distanceScaleSampler =
      typeof opts.distanceScales === 'function' ? opts.distanceScales : undefined;
    // @ts-ignore
    this.id = opts.id || this.constructor.displayName || 'viewport';

    this.x = opts.x || 0;
    this.y = opts.y || 0;
    // Silently allow apps to send in w,h = 0,0
    this.width = opts.width || 1;
    this.height = opts.height || 1;
    this.zoom = opts.zoom || 0;
    this.padding = opts.padding;
    // Linear CRS axes share metre-based common units unless the viewport supplies its own scale.
    const unitsPerWorldUnit = this.crs
      ? ([this.crs.xUnit, this.crs.yUnit, this.crs.zUnit].map(unit => unit.metersPerUnit ?? 1) as [
          number,
          number,
          number
        ])
      : undefined;
    this.distanceScales = normalizeDistanceScales({
      unitsPerWorldUnit,
      ...(this._distanceScaleSampler ? this._distanceScaleSampler() : opts.distanceScales)
    });
    this.focalDistance = opts.focalDistance || 1;
    this.position = opts.position || ZERO_VECTOR;
    this.modelMatrix = opts.modelMatrix || null;

    this.isGeospatial = Boolean(this.crs);

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
    return 1 / this.distanceScales.unitsPerMeter[2] / this.scale;
  }

  get projectionMode(): number {
    // A CRS enables CPU conversion; subclasses opt into specialized shader projection.
    return PROJECTION_MODE.IDENTITY;
  }

  // Two viewports are equal if their dimensions, common-space scale, and
  // view and projection matrices are (approximately) equal.
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
      viewport.projectionMode === this.projectionMode &&
      viewport.resolution === this.resolution &&
      viewport.projectionSignature === this.projectionSignature &&
      viewport.crs?.signature === this.crs?.signature &&
      equals(viewport.targetToCommonMatrix || IDENTITY, this.targetToCommonMatrix || IDENTITY) &&
      equals(viewport.distanceScales.unitsPerMeter, this.distanceScales.unitsPerMeter) &&
      equals(viewport.projectionMatrix, this.projectionMatrix) &&
      equals(viewport.viewMatrix, this.viewMatrix)
    );
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
    const targetZWorld = this.targetToCommonMatrix
      ? this.targetToCommonMatrix.transformAsPoint([0, 0, targetZ || 0])[2]
      : targetZ && targetZ * this.distanceScales.unitsPerWorldUnit[2];
    const coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ as number] : [X, Y];
  }

  /** Convert XYZ from the supplied CRS to common space, for CPU geometry operations.
   * Omitting sourceCrs retains WGS84 input for geospatial viewports and local input otherwise.
   */
  projectPosition(
    position: number[],
    options: ProjectPositionOptions = {}
  ): [number, number, number] {
    if (options.sourceCrs) return this._projectPositionFromCRS(position, options.sourceCrs);
    const scale = this.distanceScales.unitsPerWorldUnit;
    if (this.crs) {
      const projected = this.crs.converter.WGS84.from(position);
      return this._projectTarget([projected[0], projected[1], projected[2] || 0]);
    }
    const [x, y] = this.projectFlat(position);
    return [x, y, (position[2] || 0) * scale[2]];
  }

  /** Convert common-space XYZ back to WGS84, or to local coordinates without a CRS. */
  unprojectPosition(position: number[]): [number, number, number] {
    const scale = this.distanceScales.unitsPerWorldUnit;
    if (this.crs) {
      const projected = this.crs.converter.WGS84.to(this._unprojectCommon(position));
      return [projected[0], projected[1], projected[2] || 0];
    }
    const [x, y] = this.unprojectFlat(position);
    return [x, y, (position[2] || 0) / scale[2]];
  }

  /** Convert WGS84 XY to common space, or retain local XY without a CRS. */
  projectFlat(position: number[]): [number, number] {
    if (!this.crs) return position as [number, number];
    const projected = this.crs.converter.WGS84.from(position);
    const common = this._projectTarget([projected[0], projected[1], 0]);
    return [common[0], common[1]];
  }

  /** Convert common-space XY to WGS84, or retain local XY without a CRS. */
  unprojectFlat(position: number[]): [number, number] {
    if (!this.crs) return position as [number, number];
    const projected = this.crs.converter.WGS84.to(
      this._unprojectCommon([position[0], position[1], 0])
    );
    return [projected[0], projected[1]];
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

  /** Ground-meter scales at a target-CRS anchor, or a world anchor for a supplied sampler.
   * Unavailable CRS samples use camera scales.
   */
  getDistanceScales(coordinateOrigin?: number[]): DistanceScales {
    if (!coordinateOrigin) return this.distanceScales;
    if (this._distanceScaleSampler) {
      return normalizeDistanceScales(this._distanceScaleSampler(coordinateOrigin));
    }
    if (!this.crs) return this.distanceScales;
    const scale = this.crs.getRenderingScale(coordinateOrigin);
    if (!scale) return this.distanceScales;
    const matrix = this.targetToCommonMatrix;
    const unitsPerMeter = scale.map((value, axis) => {
      const offset = axis * 4;
      const unitsPerTargetUnit = matrix
        ? Math.hypot(matrix[offset], matrix[offset + 1], matrix[offset + 2])
        : this.distanceScales.unitsPerWorldUnit[axis];
      return unitsPerTargetUnit / value;
    }) as [number, number, number];
    return normalizeDistanceScales({...this.distanceScales, unitsPerMeter});
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
   * @param {Array} startPixel - [x,y] screen position where pan started (optional, for delta-based panning)
   * @return {Object} props of the new viewport
   */
  panByPosition(coords: number[], pixel: number[], startPixel?: number[]): any {
    return null;
  }

  // INTERNAL METHODS

  /** Convert source coordinates through the viewport's projection hooks, preserving its conventions. */
  protected _projectPositionFromCRS(
    position: number[],
    sourceCrs: CRSDescriptor
  ): [number, number, number] {
    // Dispatch back through projectPosition so built-in altitude and globe orientation remain intact.
    const geographic =
      sourceCrs.signature === WGS84_CRS.signature
        ? position
        : sourceCrs.converter.WGS84.to(position);
    return this.projectPosition(geographic);
  }

  private _projectTarget(position: number[]): [number, number, number] {
    // A target CRS need not share common-space orientation (e.g. southward tile Y).
    if (this.targetToCommonMatrix) {
      return this.targetToCommonMatrix.transformAsPoint(position, []) as [number, number, number];
    }
    return position.map((value, axis) => value * this.distanceScales.unitsPerWorldUnit[axis]) as [
      number,
      number,
      number
    ];
  }

  private _unprojectCommon(position: number[]): [number, number, number] {
    const xyz = [position[0], position[1], position[2] || 0];
    if (this._commonToTargetMatrix) {
      return this._commonToTargetMatrix.transformAsPoint(xyz, []) as [number, number, number];
    }
    return xyz.map((value, axis) => value / this.distanceScales.unitsPerWorldUnit[axis]) as [
      number,
      number,
      number
    ];
  }

  /* eslint-disable complexity, max-statements */
  private _initProps(opts: ViewportOptions) {
    if (this.crs && !opts.distanceScales) {
      this.distanceScales = this.getDistanceScales(this.crs.converter.WGS84.from(this.position));
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

    this.center = this._getCenter(opts, meterOffset);
  }

  /** Compute the camera center during construction, before subclass fields are initialized. */
  protected _getCenter(options: ViewportOptions, position: number[]): number[] {
    return this.projectPosition(position);
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
     * Builds matrices that convert common-space positions to screen pixels
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
