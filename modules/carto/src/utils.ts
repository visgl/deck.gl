import {log} from '@deck.gl/core';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
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
    get(target, property, receiver) {
      if (property in numericProps) {
        return numericProps[property as string].value[index];
      }
      return target[property as string];
    },

    has(target, property) {
      return property in numericProps || property in target;
    }
  });
}

// Utility to convert local loader into a worker loader with unpkg.com URL
export function createWorkerLoader(loader: LoaderWithParser) {
  const {id, version} = loader;
  let options = loader.options[id] as LoaderOptions;
  if (!options) {
    options = {};
    loader.options[id] = options;
  }

  options.workerUrl = `https://unpkg.com/@deck.gl/carto@${version}/dist/${id}-worker.js`;
  // For local testing `yarn build-workers` and then host `modules/carto/dist/`
  // options.workerUrl = `http://localhost:8081/dist/${id}-worker.js`;

  return {...loader, worker: true};
}
