import {getData} from './maps-v3-client';
import {LAYER_MAP, getElevationAccessor, getColorAccessor, getSizeAccessor} from './layer-map';
import {log} from '@deck.gl/core';

export async function getMapDatasets(json) {
  const {publicToken: accessToken, datasets} = json;
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
  const {keplerMapConfig, datasets} = json;
  log.assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {mapState, mapStyle} = keplerMapConfig.config;
  const {layers, interactionConfig} = keplerMapConfig.config.visState;

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    mapState,
    mapStyle,
    layers: layers.map(({id, type, config, visualChannels}) => {
      log.assert(type in LAYER_MAP, `Unsupported layer type: ${type}`);
      const {Layer, propMap, defaultProps} = LAYER_MAP[type];

      const {dataId} = config;
      const dataset = datasets.find(d => d.id === dataId);
      log.assert(dataset, `No dataset matching dataId: ${dataId}`);
      const {data} = dataset;
      log.assert(data, `No data loaded for dataId: ${dataId}`);
      return new Layer({
        id,
        data,
        ...defaultProps,
        ...createInteractionProps(interactionConfig),
        ...createStyleProps(config, propMap),
        ...createChannelProps(visualChannels, config, data) // Must come after style
      });
    })
  };
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

function createChannelProps(visualChannels, config, data) {
  const {
    colorField,
    colorScale,
    heightField,
    heightScale,
    sizeField,
    sizeScale,
    strokeColorField,
    strokeColorScale
  } = visualChannels;
  const {visConfig} = config;
  const result = {};
  if (colorField) {
    result.getFillColor = getColorAccessor(colorField, colorScale, visConfig, data);
  }
  if (strokeColorField) {
    result.getLineColor = getColorAccessor(strokeColorField, strokeColorScale, visConfig, data);
  }
  if (heightField) {
    result.getElevation = getElevationAccessor(heightField, heightScale, visConfig, data);
  }
  if (sizeField) {
    result.getPointRadius = getSizeAccessor(sizeField, sizeScale, visConfig, data);
  }

  return result;
}
