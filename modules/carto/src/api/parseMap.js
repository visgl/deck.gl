import {getLayerMap} from './layer-map';
import {log} from '@deck.gl/core';

export default function parseMap(json) {
  const {publicToken: accessToken, keplerMapConfig, datasets} = json;
  log.assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {mapState} = keplerMapConfig.config;
  const {layers} = keplerMapConfig.config.visState;
  const layerMap = getLayerMap();

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    mapState,
    layers: layers.map(({id, type, config}) => {
      log.assert(type in layerMap, `Unsupported layer type: ${type}`);
      const {Layer, propMap} = layerMap[type];
      return new Layer({
        id,
        credentials: {accessToken},
        ...createDataProps(config.dataId, datasets),
        ...createStyleProps(config, propMap)
      });
    })
  };
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
    if (config[sourceKey] === undefined) {
      continue;
    }
    if (typeof targetKey === 'string') {
      result[targetKey] = config[sourceKey];
    } else {
      [targetKey, convert] = Object.entries(targetKey)[0];
      result[targetKey] = convert(config[sourceKey]);
    }
  }
  return result;
}
