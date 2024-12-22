import {Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import {Bounds, GeoBoundingBox, TileBoundingBox, TileIndex, ZRange} from './types';
export declare const urlType: {
  type: string;
  value: any;
  validate: (value: any, propType: any) => boolean;
  equals: (value1: any, value2: any) => boolean;
};
export declare function getURLFromTemplate(
  template: string | string[],
  tile: {
    index: TileIndex;
    id: string;
  }
): string | null;
/** Get culling bounds in world space */
export declare function getCullBounds({
  viewport,
  z,
  cullRect
}: {
  /** Current viewport */
  viewport: Viewport;
  /** Current z range */
  z: ZRange | number | undefined;
  /** Culling rectangle in screen space */
  cullRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}): [number, number, number, number];
export declare function osmTile2lngLat(x: number, y: number, z: number): [number, number];
export declare function tileToBoundingBox(
  viewport: Viewport,
  x: number,
  y: number,
  z: number,
  tileSize?: number
): TileBoundingBox;
/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export declare function getTileIndices({
  viewport,
  maxZoom,
  minZoom,
  zRange,
  extent,
  tileSize,
  modelMatrix,
  modelMatrixInverse,
  zoomOffset
}: {
  viewport: Viewport;
  maxZoom?: number;
  minZoom?: number;
  zRange: ZRange | undefined;
  extent?: Bounds;
  tileSize?: number;
  modelMatrix?: Matrix4;
  modelMatrixInverse?: Matrix4;
  zoomOffset?: number;
}): TileIndex[];
/**
 * Returns true if s is a valid URL template
 */
export declare function isURLTemplate(s: string): boolean;
export declare function isGeoBoundingBox(v: any): v is GeoBoundingBox;
// # sourceMappingURL=utils.d.ts.map
