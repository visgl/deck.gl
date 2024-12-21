import {FrustumPlane} from '../utils/math-utils';
export declare type DistanceScales = {
  unitsPerMeter: number[];
  metersPerUnit: number[];
};
export declare type Padding = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};
export declare type ViewportOptions = {
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
/**
 * Manages coordinate system transformations.
 *
 * Note: The Viewport is immutable in the sense that it only has accessors.
 * A new viewport instance should be created if any parameters have changed.
 */
export default class Viewport {
  static displayName: string;
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
  distanceScales: DistanceScales; /** scale factors between world space and common space */
  scale: number; /** scale factor, equals 2^zoom */
  center: number[]; /** viewport center in common space */
  cameraPosition: number[]; /** Camera position in common space */
  projectionMatrix: number[];
  viewMatrix: number[];
  viewMatrixUncentered: number[];
  viewMatrixInverse: number[];
  viewProjectionMatrix: number[];
  pixelProjectionMatrix: number[];
  pixelUnprojectionMatrix: number[];
  resolution?: number;
  private _frustumPlanes;
  constructor(opts?: ViewportOptions);
  get metersPerPixel(): number;
  get projectionMode(): number;
  equals(viewport: Viewport): boolean;
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
  project(
    xyz: number[],
    {
      topLeft
    }?: {
      topLeft?: boolean;
    }
  ): number[];
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
    {
      topLeft,
      targetZ
    }?: {
      topLeft?: boolean;
      targetZ?: number;
    }
  ): number[];
  projectPosition(xyz: number[]): [number, number, number];
  unprojectPosition(xyz: number[]): [number, number, number];
  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */
  projectFlat(xyz: number[]): [number, number];
  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectFlat(xyz: number[]): [number, number];
  /**
   * Get bounds of the current viewport
   * @return {Array} - [minX, minY, maxX, maxY]
   */
  getBounds(options?: {z?: number}): [number, number, number, number];
  getDistanceScales(coordinateOrigin?: number[]): DistanceScales;
  containsPixel({
    x,
    y,
    width,
    height
  }: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }): boolean;
  getFrustumPlanes(): {
    left: FrustumPlane;
    right: FrustumPlane;
    bottom: FrustumPlane;
    top: FrustumPlane;
    near: FrustumPlane;
    far: FrustumPlane;
  };
  /**
   * Needed by panning and linear transition
   * Pan the viewport to place a given world coordinate at screen point [x, y]
   *
   * @param {Array} coords - world coordinates
   * @param {Array} pixel - [x,y] coordinates on screen
   * @return {Object} props of the new viewport
   */
  panByPosition(coords: number[], pixel: number[]): any;
  private _initProps;
  private _initMatrices;
}
// # sourceMappingURL=viewport.d.ts.map
