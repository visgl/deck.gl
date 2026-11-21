// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Inclusive elevation bounds used for selection. */
export type ZRange = [minZ: number, maxZ: number];

/** Axis-aligned bounds [minX, minY, maxX, maxY]. */
export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

/** Longitude and latitude tile bounds. */
export type GeoBoundingBox = {west: number; north: number; east: number; south: number};
/** Tile bounds in Cartesian layer coordinates. */
export type NonGeoBoundingBox = {left: number; top: number; right: number; bottom: number};

/** Geographic or Cartesian tile bounds. */
export type TileBoundingBox = NonGeoBoundingBox | GeoBoundingBox;

/** Tile coordinate in an x/y/z pyramid. */
export type TileIndex = {
  /** Horizontal tile index or screen-space position in the enclosing coordinate system. */
  x: number;
  /** Vertical tile index. */
  y: number;
  /** Tile pyramid zoom level. */
  z: number;
};

/** Tile metadata and request cancellation passed to content loaders. */
export type TileLoadProps = {
  /** Coordinates of the tile in its source pyramid. */
  index: TileIndex;
  /** Stable identifier assigned by the tileset. */
  id: string;
  /** Structured bounds represented by the requested tile. */
  bbox: TileBoundingBox;
  /** URL resolved from a template when applicable. */
  url?: string | null;
  /** Abort signal for cancelling content retrieval. */
  signal?: AbortSignal;
  /** Optional application metadata associated with this tile. */
  userData?: Record<string, any>;
  /** Resolved source zoom assigned by the tileset. */
  zoom?: number;
};
