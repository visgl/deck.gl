// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import union from '@turf/union';
import {type GlobalGrid} from '../grids/global-grid';
import type {Feature} from 'geojson';

type CoordPair = [number, number];

const NO_PROPERTIES = {};

/**
 * Uses the grid system's "native" cellsToBoundaryMultiPolygon if available
 * Otherwise uses turf union to combine polygons for each cell
 * @note Polygon math can be expensive for grid systems that do not support cellsToBoundaryMultiPolygon
 * @param globalGridDecoder
 * @param cellIndexes
 * @returns
 */
export function cellsToBoundaryMultiPolygon(
  globalGridDecoder: GlobalGrid,
  cellIndexes: bigint[]
): CoordPair[][][] {
  if (globalGridDecoder.cellsToBoundaryMultiPolygon) {
    return globalGridDecoder.cellsToBoundaryMultiPolygon(cellIndexes);
  }
  const polygonFeatures = cellIndexes.map(
    cellIndex =>
      ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [globalGridDecoder.cellToBoundary(cellIndex)]
        },
        properties: NO_PROPERTIES
      }) satisfies Feature
  );
  // TODO - union only handles two polygons at a time.
  const multiPolygonOrPolygon = union(polygonFeatures[0], polygonFeatures[1]);
  if (!multiPolygonOrPolygon) {
    return [];
  }
  if (multiPolygonOrPolygon.geometry.type === 'Polygon') {
    return [multiPolygonOrPolygon.geometry.coordinates as CoordPair[][]];
  }
  if (multiPolygonOrPolygon.geometry.type === 'MultiPolygon') {
    return multiPolygonOrPolygon.geometry.coordinates as CoordPair[][][];
  }
  throw new Error('Unexpected geometry type');
}
