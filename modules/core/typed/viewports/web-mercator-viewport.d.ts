import Viewport from './viewport';
import {Padding} from './viewport';
export declare type WebMercatorViewportOptions = {
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
  /** Longitude in degrees */
  longitude?: number;
  /** Latitude in degrees */
  latitude?: number;
  /** Tilt of the camera in degrees */
  pitch?: number;
  /** Heading of the camera in degrees */
  bearing?: number;
  /** Camera altitude relative to the viewport height, legacy property used to control the FOV. Default `1.5` */
  altitude?: number;
  /** Camera fovy in degrees. If provided, overrides `altitude` */
  fovy?: number;
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  /** Model matrix of viewport center */
  modelMatrix?: number[] | null;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Use orthographic projection */
  orthographic?: boolean;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default `0.1` */
  nearZMultiplier?: number;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default `1.01` */
  farZMultiplier?: number;
  /** Render multiple copies of the world */
  repeat?: boolean;
  /** Internal use */
  worldOffset?: number;
  /** @deprecated Revert to approximated meter size calculation prior to v8.5 */
  legacyMeterSizes?: boolean;
};
/**
 * Manages transformations to/from WGS84 coordinates using the Web Mercator Projection.
 */
export default class WebMercatorViewport extends Viewport {
  static displayName: string;
  longitude: number;
  latitude: number;
  pitch: number;
  bearing: number;
  altitude: number;
  fovy: number;
  orthographic: boolean;
  /** Each sub viewport renders one copy of the world if repeat:true. The list is generated and cached on first request. */
  private _subViewports;
  /** @deprecated Revert to approximated meter size calculation prior to v8.5 */
  private _pseudoMeters;
  constructor(opts?: WebMercatorViewportOptions);
  get subViewports(): WebMercatorViewport[] | null;
  projectPosition(xyz: number[]): [number, number, number];
  unprojectPosition(xyz: number[]): [number, number, number];
  /**
   * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
   */
  addMetersToLngLat(lngLatZ: number[], xyz: number[]): number[];
  panByPosition(coords: number[], pixel: number[]): WebMercatorViewportOptions;
  getBounds(options?: {z?: number}): [number, number, number, number];
  /**
   * Returns a new viewport that fit around the given rectangle.
   * Only supports non-perspective mode.
   */
  fitBounds(
    /** [[lon, lat], [lon, lat]] */
    bounds: [[number, number], [number, number]],
    options?: {
      /** If not supplied, will use the current width of the viewport (default `1`) */
      width?: number;
      /** If not supplied, will use the current height of the viewport (default `1`) */
      height?: number;
      /** In degrees, 0.01 would be about 1000 meters */
      minExtent?: number;
      /** Max zoom level */
      maxZoom?: number;
      /** Extra padding in pixels */
      padding?: number | Required<Padding>;
      /** Center shift in pixels */
      offset?: number[];
    }
  ): WebMercatorViewport;
}
// # sourceMappingURL=web-mercator-viewport.d.ts.map
