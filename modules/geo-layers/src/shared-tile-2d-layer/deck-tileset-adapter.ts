// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import type {
  Bounds,
  GeoBoundingBox,
  TileBoundingBox,
  TileIndex,
  ZRange
} from '../shared-tileset-2d/types';
import type {
  SharedTileset2DAdapter,
  SharedTileset2DTileContext,
  SharedTileset2DTraversalContext
} from '../shared-tileset-2d/adapter';
import {getOSMTileIndices} from './deck-tile-traversal';

const TILE_SIZE = 512;
const DEFAULT_EXTENT: Bounds = [-Infinity, -Infinity, Infinity, Infinity];

/** deck.gl viewport type used by the shared tile layer adapter. */
export type SharedTile2DDeckViewState = Viewport;

/** Applies a model transform to an axis-aligned bounding box. */
export function transformBox(bbox: Bounds, modelMatrix: Matrix4): Bounds {
  const transformedCoords = [
    modelMatrix.transformAsPoint([bbox[0], bbox[1]]),
    modelMatrix.transformAsPoint([bbox[2], bbox[1]]),
    modelMatrix.transformAsPoint([bbox[0], bbox[3]]),
    modelMatrix.transformAsPoint([bbox[2], bbox[3]])
  ];
  return [
    Math.min(...transformedCoords.map(i => i[0])),
    Math.min(...transformedCoords.map(i => i[1])),
    Math.max(...transformedCoords.map(i => i[0])),
    Math.max(...transformedCoords.map(i => i[1]))
  ];
}

function getBoundingBox(viewport: Viewport, zRange: number[] | null, extent: Bounds): Bounds {
  let bounds;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const bounds0 = viewport.getBounds({z: minZ});
    const bounds1 = viewport.getBounds({z: maxZ});
    bounds = [
      Math.min(bounds0[0], bounds1[0]),
      Math.min(bounds0[1], bounds1[1]),
      Math.max(bounds0[2], bounds1[2]),
      Math.max(bounds0[3], bounds1[3])
    ];
  } else {
    bounds = viewport.getBounds();
  }
  if (!viewport.isGeospatial) {
    return [
      Math.max(Math.min(bounds[0], extent[2]), extent[0]),
      Math.max(Math.min(bounds[1], extent[3]), extent[1]),
      Math.min(Math.max(bounds[2], extent[0]), extent[2]),
      Math.min(Math.max(bounds[3], extent[1]), extent[3])
    ];
  }
  return [
    Math.max(bounds[0], extent[0]),
    Math.max(bounds[1], extent[1]),
    Math.min(bounds[2], extent[2]),
    Math.min(bounds[3], extent[3])
  ];
}

/** Computes cull bounds in projected/world coordinates for one deck viewport. */
export function getCullBounds({
  viewport,
  z,
  cullRect
}: {
  viewport: Viewport;
  z: ZRange | number | null;
  cullRect: {x: number; y: number; width: number; height: number};
}): [number, number, number, number][] {
  const subViewports = viewport.subViewports || [viewport];
  return subViewports.map(v => getCullBoundsInViewport(v, z || 0, cullRect));
}

function getCullBoundsInViewport(
  viewport: Viewport,
  z: ZRange | number,
  cullRect: {x: number; y: number; width: number; height: number}
): [number, number, number, number] {
  if (!Array.isArray(z)) {
    const x = cullRect.x - viewport.x;
    const y = cullRect.y - viewport.y;
    const {width, height} = cullRect;
    const unprojectOption = {targetZ: z};

    const topLeft = viewport.unproject([x, y], unprojectOption);
    const topRight = viewport.unproject([x + width, y], unprojectOption);
    const bottomLeft = viewport.unproject([x, y + height], unprojectOption);
    const bottomRight = viewport.unproject([x + width, y + height], unprojectOption);

    return [
      Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
    ];
  }

  const bounds0 = getCullBoundsInViewport(viewport, z[0], cullRect);
  const bounds1 = getCullBoundsInViewport(viewport, z[1], cullRect);

  return [
    Math.min(bounds0[0], bounds1[0]),
    Math.min(bounds0[1], bounds1[1]),
    Math.max(bounds0[2], bounds1[2]),
    Math.max(bounds0[3], bounds1[3])
  ];
}

function getIndexingCoords(
  bbox: Bounds,
  scale: number,
  modelMatrixInverse?: Matrix4 | null
): Bounds {
  if (modelMatrixInverse) {
    return transformBox(bbox, modelMatrixInverse).map(i => (i * scale) / TILE_SIZE) as Bounds;
  }
  return bbox.map(i => (i * scale) / TILE_SIZE) as Bounds;
}

function getScale(z: number, tileSize: number): number {
  return (Math.pow(2, z) * TILE_SIZE) / tileSize;
}

/** Converts an OSM tile coordinate to longitude/latitude. */
export function osmTile2lngLat(x: number, y: number, z: number): [number, number] {
  const scale = getScale(z, TILE_SIZE);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function tile2XY(x: number, y: number, z: number, tileSize: number): [number, number] {
  const scale = getScale(z, tileSize);
  return [(x / scale) * TILE_SIZE, (y / scale) * TILE_SIZE];
}

function tileToBoundingBox(
  viewport: Viewport,
  x: number,
  y: number,
  z: number,
  tileSize: number = TILE_SIZE
): TileBoundingBox {
  if (viewport.isGeospatial) {
    const [west, north] = osmTile2lngLat(x, y, z);
    const [east, south] = osmTile2lngLat(x + 1, y + 1, z);
    return {west, north, east, south};
  }
  const [left, top] = tile2XY(x, y, z, tileSize);
  const [right, bottom] = tile2XY(x + 1, y + 1, z, tileSize);
  return {left, top, right, bottom};
}

function getIdentityTileIndices(
  viewport: Viewport,
  z: number,
  tileSize: number,
  extent: Bounds,
  modelMatrixInverse?: Matrix4 | null
): TileIndex[] {
  const bbox = getBoundingBox(viewport, null, extent);
  const scale = getScale(z, tileSize);
  const [minX, minY, maxX, maxY] = getIndexingCoords(bbox, scale, modelMatrixInverse);
  const indices: TileIndex[] = [];

  for (let x = Math.floor(minX); x < maxX; x++) {
    for (let y = Math.floor(minY); y < maxY; y++) {
      indices.push({x, y, z});
    }
  }
  return indices;
}

function getTileZoomForViewport(viewport: Viewport, tileSize: number, zoomOffset: number): number {
  return viewport.isGeospatial
    ? Math.round(viewport.zoom + Math.log2(TILE_SIZE / tileSize)) + zoomOffset
    : Math.ceil(viewport.zoom) + zoomOffset;
}

function applyZoomBounds(
  z: number,
  minZoom: number | undefined,
  maxZoom: number | undefined,
  extent?: Bounds | null
): number | null {
  if (typeof minZoom === 'number' && Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return null;
    }
    z = minZoom;
  }
  if (typeof maxZoom === 'number' && Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }
  return z;
}

function getDeckTileIndices(context: SharedTileset2DTraversalContext<Viewport>): TileIndex[] {
  const {
    viewState: viewport,
    maxZoom,
    minZoom,
    zRange = null,
    extent,
    tileSize = TILE_SIZE,
    modelMatrix,
    modelMatrixInverse,
    zoomOffset = 0
  } = context;
  if (
    (context.visibleMinZoom != null && viewport.zoom < context.visibleMinZoom) ||
    (context.visibleMaxZoom != null && viewport.zoom > context.visibleMaxZoom)
  )
    return [];
  let z: number | null = getTileZoomForViewport(viewport, tileSize, zoomOffset);
  z = applyZoomBounds(z, minZoom, maxZoom, extent);
  if (z === null) {
    return [];
  }

  let transformedExtent = extent || undefined;
  if (modelMatrix && modelMatrixInverse && extent && !viewport.isGeospatial) {
    transformedExtent = transformBox(extent, modelMatrix);
  }

  return viewport.isGeospatial
    ? getOSMTileIndices(viewport, z, zRange, extent || undefined)
    : getIdentityTileIndices(
        viewport,
        z,
        tileSize,
        transformedExtent || DEFAULT_EXTENT,
        modelMatrixInverse
      );
}

function getDeckTileBoundingBox(
  context: SharedTileset2DTileContext<Viewport>,
  index: TileIndex
): TileBoundingBox {
  return tileToBoundingBox(context.viewState, index.x, index.y, index.z, context.tileSize);
}

/** Deck.gl adapter used by {@link SharedTile2DLayer} to drive a generic {@link SharedTileset2D}. */
export const sharedTile2DDeckAdapter: SharedTileset2DAdapter<Viewport> = {
  getTileIndices: getDeckTileIndices,
  getTileBoundingBox: getDeckTileBoundingBox
};

/** Type guard for geographic tile bounds. */
export function isGeoBoundingBox(v: any): v is GeoBoundingBox {
  return (
    Number.isFinite(v.west) &&
    Number.isFinite(v.north) &&
    Number.isFinite(v.east) &&
    Number.isFinite(v.south)
  );
}
