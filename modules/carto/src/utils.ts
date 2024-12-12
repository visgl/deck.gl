// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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
