// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import earcut from 'earcut';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatureCollection, BinaryPolygonFeature, TypedArray} from '@loaders.gl/schema';

import {TileReader} from './carto-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoVectorTile';

type CartoVectorTileLoaderOptions = LoaderOptions & {
  cartoVectorTile?: {
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoVectorTileLoaderOptions = {
  cartoVectorTile: {
    workerUrl: getWorkerUrl(id, VERSION)
  }
};

const CartoVectorTileLoader: LoaderWithParser = {
  name: 'CARTO Vector Tile',
  version: VERSION,
  id,
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-vector-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options?: CartoVectorTileLoaderOptions) =>
    parseCartoVectorTile(arrayBuffer, options),
  parseSync: parseCartoVectorTile,
  worker: true,
  options: DEFAULT_OPTIONS
};

function triangulatePolygon(
  polygons: BinaryPolygonFeature,
  target: number[],
  {
    startPosition,
    endPosition,
    indices
  }: {startPosition: number; endPosition: number; indices: TypedArray}
): void {
  const coordLength = polygons.positions.size;
  const start = startPosition * coordLength;
  const end = endPosition * coordLength;

  // Extract positions and holes for just this polygon
  const polygonPositions = polygons.positions.value.subarray(start, end);

  // Holes are referenced relative to outer polygon
  const holes = indices.slice(1).map((n: number) => n - startPosition);

  // Compute triangulation
  const triangles = earcut(polygonPositions, holes, coordLength);

  // Indices returned by triangulation are relative to start
  // of polygon, so we need to offset
  for (let t = 0, tl = triangles.length; t < tl; ++t) {
    target.push(startPosition + triangles[t]);
  }
}

function triangulate(polygons: BinaryPolygonFeature) {
  const {polygonIndices, primitivePolygonIndices} = polygons;
  const triangles = [];

  let rangeStart = 0;
  for (let i = 0; i < polygonIndices.value.length - 1; i++) {
    const startPosition = polygonIndices.value[i];
    const endPosition = polygonIndices.value[i + 1];

    // Extract hole indices between start & end position
    const rangeEnd = primitivePolygonIndices.value.indexOf(endPosition);
    const indices = primitivePolygonIndices.value.subarray(rangeStart, rangeEnd);
    rangeStart = rangeEnd;

    triangulatePolygon(polygons, triangles, {startPosition, endPosition, indices});
  }

  polygons.triangles = {value: new Uint32Array(triangles), size: 1};
}

function parseCartoVectorTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoVectorTileLoaderOptions
): BinaryFeatureCollection | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer, TileReader);

  if (tile.polygons && !tile.polygons.triangles) {
    triangulate(tile.polygons);
  }

  return tile;
}

export default CartoVectorTileLoader;
