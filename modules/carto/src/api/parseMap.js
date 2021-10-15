import CartoLayer from '../layers/carto-layer';
import {log} from '@deck.gl/core';

const sharedPropMap = {
  filled: 'filled',
  radius: 'getPointRadius',
  opacity: 'opacity',
  fixedRadius: {pointRadiusUnits: v => (v ? 'meters' : 'pixels')},
  outline: 'stroked',
  isVisible: 'visible'
};

export default function parseMap(json) {
  const {
    id,
    title,
    description,
    createdAt,
    updatedAt,
    publicToken: accessToken,
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
    layers: layers.map(({id, type, config}) => {
      log.assert(type in LAYER_MAPPING, `Unsupported layer type: ${type}`);
      const {Layer, propMap} = LAYER_MAPPING[type];
      return new Layer({
        id,
        credentials: {accessToken},
        ...createDataProps(config.dataId, datasets),
        ...createStyleProps(config, propMap)
      });
    })
  };

  return map;
}

function createDataProps(dataId, datasets) {
  const dataset = datasets.find(d => d.id === dataId);
  log.assert(dataset, `No dataset matching dataId: ${dataId}`);
  const {connectionName: connection, source: data, type} = dataset;
  return {connection, data, type};
}

function createStyleProps(config, mapping) {
  // Flatten configuration
  const {visConfig, ...rest} = config;
  config = {...visConfig, ...rest};

  const result = {};
  let convert;
  let targetKey;
  for (const sourceKey in mapping) {
    targetKey = mapping[sourceKey];
    if (typeof targetKey === 'string') {
      result[targetKey] = config[sourceKey];
    } else {
      [targetKey, convert] = Object.entries(targetKey)[0];
      result[targetKey] = convert(config[sourceKey]);
    }
  }
  return result;
}
