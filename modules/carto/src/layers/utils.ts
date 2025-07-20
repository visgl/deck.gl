// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log} from '@deck.gl/core';
import {Tile as PropertiesTile} from './schema/carto-properties-tile';
import {Tile as VectorTile} from './schema/carto-tile';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {TilejsonResult} from '@carto/api-client';

/**
 * Merges load options with additional options, creating a new object without mutating the input.
 * Handles nested objects through recursive deep merge with protection against circular references.
 */
export function mergeLoadOptions(loadOptions: any, additionalOptions: any, depth = 0): any {
  if (!loadOptions) {
    return additionalOptions;
  }
  if (!additionalOptions) {
    return loadOptions;
  }

  // Safety check against deep recursion
  if (depth > 10) {
    return additionalOptions;
  }

  const result = {...loadOptions};

  for (const key in additionalOptions) {
    const value = additionalOptions[key];
    // Skip circular references
    if (value === loadOptions || value === additionalOptions) {
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      result[key] = mergeLoadOptions(loadOptions[key], value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// eslint-disable-next-line max-statements
export function mergeBoundaryData(geometry: VectorTile, properties: PropertiesTile): VectorTile {
  const mapping = {};
  for (const {geoid, ...rest} of properties.properties) {
    if (geoid in mapping) {
      log.warn('Duplicate geoid key in boundary mapping, using first occurance')();
    } else {
      mapping[geoid] = rest;
    }
  }

  for (const type of ['points', 'lines', 'polygons']) {
    const geom = geometry[type];
    if (geom.positions.value.length === 0) {
      continue;
    }

    geom.properties = geom.properties.map(({geoid}) => mapping[geoid]);

    // numericProps need to be filled to match length of positions buffer
    const {positions, globalFeatureIds} = geom;
    let indices: Uint16Array | Uint32Array | null = null;
    if (type === 'lines') indices = geom.pathIndices.value;
    if (type === 'polygons') indices = geom.polygonIndices.value;
    const length = positions.value.length / positions.size;
    for (const key in properties.numericProps) {
      const sourceProp = properties.numericProps[key].value;
      const TypedArray = sourceProp.constructor as
        | Float32ArrayConstructor
        | Float64ArrayConstructor;
      const destProp = new TypedArray(length);
      geom.numericProps[key] = {value: destProp, size: 1};

      if (!indices) {
        for (let i = 0; i < length; i++) {
          // points
          const featureId = globalFeatureIds.value[i];
          destProp[i] = sourceProp[featureId];
        }
      } else {
        // lines|polygons
        for (let i = 0; i < indices.length - 1; i++) {
          const startIndex = indices[i];
          const endIndex = indices[i + 1];
          const featureId = globalFeatureIds.value[startIndex];
          destProp.fill(sourceProp[featureId], startIndex, endIndex);
        }
      }
    }
  }

  return geometry;
}

export const TilejsonPropType = {
  type: 'object' as const,
  value: null as null | TilejsonResult,
  validate: (value: TilejsonResult, propType) =>
    (propType.optional && value === null) ||
    (typeof value === 'object' &&
      Array.isArray(value.tiles) &&
      value.tiles.every(url => typeof url === 'string')),
  equal: (value1, value2) => {
    return deepEqual(value1, value2, 2);
  },
  async: true
};
