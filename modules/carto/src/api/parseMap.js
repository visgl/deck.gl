import CartoLayer from '../layers/carto-layer';
import {log} from '@deck.gl/core';

export default function parseMap(json) {
  const {
    id,
    title,
    description,
    createdAt,
    updatedAt,
    publicToken,
    keplerMapConfig,
    datasets
  } = json;

  log.assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {layers} = keplerMapConfig.config.visState;

  const LAYER_MAPPING = {
    point: {
      Layer: CartoLayer,
      propMap: {
        color: 'getFillColor',
        ...sharedPropMap
      }
    }
  };

  const map = {
    id,
    title,
    description,
    createdAt,
    updatedAt,
    layers: layers.map(({type, config}) => {
      log.assert(type in LAYER_MAPPING, `Unsupported layer type: ${type}`);
      const {Layer, propMap} = LAYER_MAPPING[type];
      return new Layer(createProps(config, propMap));
    })
  };

  return map;
}

const sharedPropMap = {};

function createProps(config, mapping) {
  const result = {};
  for (const sourceKey in mapping) {
    const targetKey = mapping[sourceKey];
    result[targetKey] = config[sourceKey];
  }
  return result;
}
