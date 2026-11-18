// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {convertGeoArrowVectorCellToGeoJSON} from '@loaders.gl/core/geoarrow';
import type {RecordBatch, Table} from 'apache-arrow';
import type {Color} from '@deck.gl/core';
import type {Feature, Geometry} from 'geojson';
import type {GeoArrowLayerGeometryType} from './resolve-geoarrow-geometry';

/** Feature properties retain the original Arrow row index across geometry dispatch. */
export type GeoArrowFeatureProperties = {rowIndex: number};

/** Decodes geometries for the GeoJSON fallback without materializing Arrow row properties. */
export function makeGeoArrowFeatures(
  data: Table | RecordBatch,
  columnName: string,
  encoding: GeoArrowLayerGeometryType
): Feature<Geometry, GeoArrowFeatureProperties>[] {
  /** Geometry column in source row order. */
  const column = data.getChild(columnName)!;
  /** Renderable features, excluding null geometries. */
  const features: Feature<Geometry, GeoArrowFeatureProperties>[] = [];
  for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
    /** Geometry decoded by the shared converter, including mixed union cells. */
    const geometry = convertGeoArrowVectorCellToGeoJSON(column, rowIndex, encoding);
    if (geometry) {
      features.push({type: 'Feature', geometry: geometry as Geometry, properties: {rowIndex}});
    }
  }
  return features;
}

/** Resolves a constant or CPU column into a value accessor keyed by original row index. */
export function makeGeoArrowFeatureAccessor<Value extends Color | number>(
  data: Table | RecordBatch,
  input: unknown,
  fallback: Value
): (feature: Feature<Geometry, GeoArrowFeatureProperties>) => Value {
  /** Source and null fallback for the optional column descriptor. */
  const descriptor = input && typeof input === 'object' && 'source' in input ? input : null;
  /** Constant, column name, or caller-owned Arrow vector. */
  const source = descriptor ? descriptor.source : input;
  /** Value used when a style column contains null. */
  const nullValue =
    descriptor && 'nullValue' in descriptor ? (descriptor.nullValue as Value) : fallback;
  if (source === undefined || typeof source === 'number' || Array.isArray(source)) {
    return () => (source === undefined ? fallback : (source as Value));
  }
  /** Resolved Arrow vector. */
  const column = typeof source === 'string' ? data.getChild(source) : source;
  if (
    !column ||
    typeof column !== 'object' ||
    !('get' in column) ||
    typeof column.get !== 'function'
  ) {
    throw new Error('Encoded and mixed GeoArrow geometry requires CPU-readable styling columns');
  }
  if (!('length' in column) || column.length !== data.numRows) {
    throw new Error('GeoArrow styling column length must match source rows');
  }
  return feature => {
    /** Style value from the original source row. */
    const value = column.get(feature.properties.rowIndex);
    if (value == null) {
      return nullValue;
    }
    return typeof fallback === 'number' ? (Number(value) as Value) : (Array.from(value) as Value);
  };
}
