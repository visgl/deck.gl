// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {cellToParent} from 'quadbin';
import {_Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {Accessor, log} from '@deck.gl/core';
import {BinaryFeatureCollection} from '@loaders.gl/schema';

export type Aggregation = 'any' | 'average' | 'count' | 'min' | 'max' | 'sum';
export type AggregationProperties<FeaturePropertiesT> = {
  aggregation: Aggregation;
  name: keyof FeaturePropertiesT;
}[];
export type ClusteredFeaturePropertiesT<FeaturePropertiesT> = FeaturePropertiesT & {
  id: bigint;
  count: number;
  position: [number, number];
};
export type ParsedQuadbinCell<FeaturePropertiesT> = {id: bigint; properties: FeaturePropertiesT};
export type ParsedQuadbinTile<FeaturePropertiesT> = ParsedQuadbinCell<FeaturePropertiesT>[];

/**
 * Aggregates tile by specified properties, caching result in tile.userData
 *
 * @returns true if data was aggregated, false if cache used
 */
export function aggregateTile<FeaturePropertiesT>(
  tile: Tile2DHeader<ParsedQuadbinTile<FeaturePropertiesT>>,
  tileAggregationCache: Map<number, ClusteredFeaturePropertiesT<FeaturePropertiesT>[]>,
  aggregationLevels: number,
  properties: AggregationProperties<FeaturePropertiesT> = [],
  getPosition: Accessor<ParsedQuadbinCell<FeaturePropertiesT>, [number, number]>,
  getWeight: Accessor<ParsedQuadbinCell<FeaturePropertiesT>, number>
): boolean {
  if (!tile.content) return false;

  // Aggregate on demand and cache result
  if (!tile.userData) tile.userData = {};
  const cell0 = tileAggregationCache.get(aggregationLevels)?.[0];
  if (cell0) {
    // Have already aggregated this tile
    if (properties.every(property => property.name in cell0)) {
      // Use cached result
      return false;
    }

    // Aggregated properties have changed, re-aggregate
    tileAggregationCache.clear();
  }

  const out: Record<number, any> = {};
  for (const cell of tile.content) {
    let id = cell.id;
    const position = typeof getPosition === 'function' ? getPosition(cell, {} as any) : getPosition;

    // Aggregate by parent rid
    for (let i = 0; i < aggregationLevels - 1; i++) {
      id = cellToParent(id);
    }

    // Unfortunately TS doesn't support Record<bigint, any>
    // https://github.com/microsoft/TypeScript/issues/46395
    const parentId = Number(id);
    if (!(parentId in out)) {
      out[parentId] = {id, count: 0, position: [0, 0]};
      for (const {name, aggregation} of properties) {
        if (aggregation === 'any') {
          // Just pick first value for ANY
          out[parentId][name] = cell.properties[name];
        } else {
          out[parentId][name] = 0;
        }
      }
    }
    // Layout props
    const prevTotalW = out[parentId].count;
    out[parentId].count += typeof getWeight === 'function' ? getWeight(cell, {} as any) : getWeight;

    const totalW = out[parentId].count;
    const W = totalW - prevTotalW;
    out[parentId].position[0] = (prevTotalW * out[parentId].position[0] + W * position[0]) / totalW;
    out[parentId].position[1] = (prevTotalW * out[parentId].position[1] + W * position[1]) / totalW;

    // Re-aggregate other properties so clusters can be styled
    for (const {name, aggregation} of properties) {
      const prevValue = out[parentId][name];
      const value = cell.properties[name] as number;
      if (aggregation === 'average') {
        out[parentId][name] = (prevTotalW * prevValue + W * value) / totalW;
      } else if (aggregation === 'count' || aggregation === 'sum') {
        out[parentId][name] = prevValue + value;
      } else if (aggregation === 'max') {
        out[parentId][name] = Math.max(prevValue, value);
      } else if (aggregation === 'min') {
        out[parentId][name] = Math.min(prevValue, value);
      }
    }
  }

  tileAggregationCache.set(aggregationLevels, Object.values(out));
  return true;
}

export function extractAggregationProperties<FeaturePropertiesT extends {}>(
  tile: Tile2DHeader<ParsedQuadbinTile<FeaturePropertiesT>>
): AggregationProperties<FeaturePropertiesT> {
  const properties: AggregationProperties<FeaturePropertiesT> = [];
  const validAggregations: Aggregation[] = ['any', 'average', 'count', 'min', 'max', 'sum'];
  for (const name of Object.keys(tile.content![0].properties)) {
    let aggregation = name.split('_').pop()!.toLowerCase() as Aggregation;
    if (!validAggregations.includes(aggregation)) {
      log.warn(`No valid aggregation present in ${name} property`)();
      aggregation = 'any';
    }
    properties.push({name: name as keyof FeaturePropertiesT, aggregation});
  }

  return properties;
}

export function computeAggregationStats<FeaturePropertiesT>(
  data: ClusteredFeaturePropertiesT<FeaturePropertiesT>[],
  properties: AggregationProperties<FeaturePropertiesT>
) {
  const stats = {} as Record<keyof FeaturePropertiesT, {min: number; max: number}>;
  for (const {name, aggregation} of properties) {
    stats[name] = {min: Infinity, max: -Infinity};
    if (aggregation !== 'any') {
      for (const d of data) {
        stats[name].min = Math.min(stats[name].min, d[name] as number);
        stats[name].max = Math.max(stats[name].max, d[name] as number);
      }
    }
  }

  return stats;
}

const EMPTY_UINT16ARRAY = new Uint16Array();
const EMPTY_BINARY_PROPS = {
  positions: {value: new Float32Array(), size: 2},
  properties: [],
  numericProps: {},
  featureIds: {value: EMPTY_UINT16ARRAY, size: 1},
  globalFeatureIds: {value: EMPTY_UINT16ARRAY, size: 1}
};

type BinaryFeatureCollectionWithStats<FeaturePropertiesT> = Omit<
  BinaryFeatureCollection,
  'points'
> & {
  points: BinaryFeatureCollection['points'] & {
    attributes?: {
      stats: Record<keyof FeaturePropertiesT, {min: number; max: number}>;
    };
  };
};

export function clustersToBinary<FeaturePropertiesT>(
  data: ClusteredFeaturePropertiesT<FeaturePropertiesT>[]
): BinaryFeatureCollectionWithStats<FeaturePropertiesT> {
  const positions = new Float32Array(data.length * 2);
  const featureIds = new Uint16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    positions.set(data[i].position, 2 * i);
    featureIds[i] = i;
  }

  return {
    shape: 'binary-feature-collection',
    points: {
      type: 'Point',
      positions: {value: positions, size: 2},
      properties: data,
      numericProps: {},
      featureIds: {value: featureIds, size: 1},
      globalFeatureIds: {value: featureIds, size: 1}
    },
    lines: {
      type: 'LineString',
      pathIndices: {value: EMPTY_UINT16ARRAY, size: 1},
      ...EMPTY_BINARY_PROPS
    },
    polygons: {
      type: 'Polygon',
      polygonIndices: {value: EMPTY_UINT16ARRAY, size: 1},
      primitivePolygonIndices: {value: EMPTY_UINT16ARRAY, size: 1},
      ...EMPTY_BINARY_PROPS
    }
  };
}
