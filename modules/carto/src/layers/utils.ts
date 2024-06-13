import {log} from '@deck.gl/core';
import {Tile as PropertiesTile} from './schema/carto-properties-tile';
import {Tile as VectorTile} from './schema/carto-tile';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {TilejsonResult} from '../sources/types';

/**
 * Adds access token to Authorization header in loadOptions
 */
export function injectAccessToken(loadOptions: any, accessToken: string): void {
  if (!loadOptions?.fetch?.headers?.Authorization) {
    loadOptions.fetch = {
      ...loadOptions.fetch,
      headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
    };
  }
}

export function mergeBoundaryData(
  geometry: VectorTile,
  properties: PropertiesTile,
  matchingColumn: string
): VectorTile {
  const mapping = {};
  for (const property of properties.properties) {
    const matchingKey = property[matchingColumn];
    if (!matchingKey) {
      log.warn(
        `Properties: Missing value for matchingKey with matchingColumn: ${matchingColumn}`
      )();
    }
    if (matchingKey in mapping) {
      log.warn('Properties: Duplicate key in boundary mapping, using first occurrence')();
    } else {
      mapping[matchingKey] = property;
    }
  }

  for (const type of ['points', 'lines', 'polygons']) {
    const geom = geometry[type];
    if (geom.positions.value.length === 0) {
      continue;
    }

    geom.properties = geom.properties.map((property: Record<string, string>) => {
      const matchingKey = property[matchingColumn];
      if (!matchingKey) {
        log.warn(
          `Boundaries: Missing value for matchingKey with matchingColumn: ${matchingColumn}`
        )();
      }

      return mapping[matchingKey];
    });

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
