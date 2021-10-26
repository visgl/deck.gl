import {getData} from './maps-v3-client';
import {getLayerMap, getSizeAccessor} from './layer-map';
import {log} from '@deck.gl/core';

export async function getMapDatasets(json) {
  const {publicToken: accessToken, keplerMapConfig, datasets} = json;
  const {layers} = keplerMapConfig.config.visState;

  const promises = datasets.map(dataset => {
    const {connectionName: connection, source, type} = dataset;
    return getData({
      credentials: {accessToken},
      connection,
      source,
      type
    });
  });

  const fetchedDatasets = await Promise.all(promises);
  datasets.forEach((dataset, index) => {
    dataset.data = fetchedDatasets[index];
  });
}

export function parseMap(json) {
  const {publicToken: accessToken, keplerMapConfig, datasets} = json;
  log.assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {mapState} = keplerMapConfig.config;
  const {layers, interactionConfig} = keplerMapConfig.config.visState;
  const layerMap = getLayerMap();

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    mapState,
    layers: layers.map(({id, type, config, visualChannels}) => {
      log.assert(type in layerMap, `Unsupported layer type: ${type}`);
      const {Layer, propMap, defaultProps} = layerMap[type];
      return new Layer({
        id,
        credentials: {accessToken},
        ...defaultProps,
        ...createDataProps(config.dataId, datasets),
        ...createInteractionProps(interactionConfig),
        ...createStyleProps(config, propMap),
        ...createChannelProps(visualChannels, propMap) // Must come after style
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

function createInteractionProps(interactionConfig) {
  // TODO these seem to be the correct properties but
  // autoHighlight doesn't work
  const pickable = interactionConfig.tooltip.enabled;
  return {
    autoHighlight: pickable,
    pickable
  };
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
      // eslint-disable-next-line no-continue
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

function createChannelProps({sizeField, sizeScale}) {
  const result = {};
  if (sizeField) {
    result.getPointRadius = getSizeAccessor(sizeField, sizeScale);
  }

  return result;
}
