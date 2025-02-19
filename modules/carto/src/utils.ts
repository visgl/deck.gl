// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  BinaryAttribute,
  BinaryFeature,
  BinaryFeatureCollection,
  BinaryPointFeature
} from '@loaders.gl/schema';
import {log} from '@deck.gl/core';
import type {Properties, NumericProps} from './layers/schema/spatialjson-utils';

export function assert(condition: unknown, message?: string): asserts condition {
  log.assert(condition, message);
}

// Returns a Proxy object that allows accessing binary data
// as if it were JSON properties
export function createBinaryProxy(
  data: {numericProps: NumericProps; properties: Properties[]},
  index: number
) {
  const {properties, numericProps} = data;
  return new Proxy(properties[index] || {}, {
    get(target, property) {
      if (property in numericProps) {
        return numericProps[property as string].value[index];
      }
      return target[property as string];
    },

    has(target, property) {
      return property in numericProps || property in target;
    },

    ownKeys(target) {
      return [...Object.keys(numericProps), ...Reflect.ownKeys(target)];
    },

    getOwnPropertyDescriptor(target, prop) {
      return {enumerable: true, configurable: true};
    }
  });
}

export function getWorkerUrl(id: string, version: string) {
  // For local testing `yarn build-workers` and then host `modules/carto/dist/`
  // return `http://localhost:8081/dist/${id}-worker.js`;
  return `https://unpkg.com/@deck.gl/carto@${version}/dist/${id}-worker.js`;
}

export function scaleIdentity() {
  let unknown;

  function scale(x) {
    return x === null ? unknown : x;
  }

  scale.invert = scale;

  scale.domain = scale.range = d => d;

  scale.unknown = u => {
    if (u) {
      unknown = u;
    }

    return unknown;
  };

  scale.copy = () => {
    const scaleCopy = scaleIdentity();
    scaleCopy.unknown(unknown);
    return scaleCopy;
  };

  return scale;
}

export const isObject: (x: unknown) => boolean = x => x !== null && typeof x === 'object';

export const isPureObject: (x: any) => boolean = x =>
  isObject(x) && x.constructor === {}.constructor;

// Helpers for binary data
const EMPTY_UINT16ARRAY = new Uint16Array();
const EMPTY_BINARY_PROPS: Omit<BinaryPointFeature, 'type'> = {
  positions: {value: new Float32Array(), size: 2},
  properties: [],
  numericProps: {},
  featureIds: {value: EMPTY_UINT16ARRAY, size: 1},
  globalFeatureIds: {value: EMPTY_UINT16ARRAY, size: 1}
};

export function createEmptyBinary(): Required<BinaryFeatureCollection> {
  return {
    shape: 'binary-feature-collection',
    points: {
      type: 'Point',
      ...EMPTY_BINARY_PROPS
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

export function createBinaryPointFeature(
  positions: number[] | Float32Array | Float64Array,
  featureIds: number[] | Uint16Array | Uint32Array,
  globalFeatureIds: number[] | Uint16Array | Uint32Array,
  numericProps: NumericProps,
  properties: Properties,
  size: 2 | 3 = 2
): BinaryPointFeature {
  return {
    type: 'Point',
    positions: {value: new Float32Array(positions), size},
    featureIds: {value: new Uint16Array(featureIds), size: 1},
    globalFeatureIds: {value: new Uint32Array(globalFeatureIds), size: 1},
    numericProps,
    properties
  };
}

export function initializeNumericProps(
  numPoints: number,
  sourceProps?: NumericProps
): NumericProps {
  const numericProps: NumericProps = {};
  if (sourceProps) {
    Object.keys(sourceProps).forEach(prop => {
      numericProps[prop] = {value: new Float32Array(numPoints), size: 1};
    });
  }
  return numericProps;
}

export function copyNumericProps(
  sourceProps: NumericProps,
  targetProps: NumericProps,
  sourceIndex: number,
  targetIndex: number
): void {
  Object.keys(sourceProps).forEach(prop => {
    targetProps[prop].value[targetIndex] = sourceProps[prop].value[sourceIndex];
  });
}
