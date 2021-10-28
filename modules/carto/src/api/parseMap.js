import GL from '@luma.gl/constants';
import {
  LAYER_MAP,
  getElevationAccessor,
  getColorAccessor,
  getSizeAccessor,
  getTextAccessor
} from './layer-map';
import {log} from '@deck.gl/core';

export function parseMap(json) {
  const {keplerMapConfig, datasets} = json;
  log.assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {mapState, mapStyle} = keplerMapConfig.config;
  const {layers, layerBlending, interactionConfig} = keplerMapConfig.config.visState;

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
        ...createBlendingProps(layerBlending),
        ...createInteractionProps(interactionConfig),
        ...createStyleProps(config, propMap),
        ...createChannelProps(visualChannels, config, data) // Must come after style
      });
    })
  };
}

function createBlendingProps(layerBlending) {
  if (layerBlending === 'additive') {
    return {
      parameters: {
        blendFunc: [GL.SRC_ALPHA, GL.DST_ALPHA],
        blendEquation: GL.FUNC_ADD
      }
    };
  } else if (layerBlending === 'subtractive') {
    return {
      parameters: {
        blendFunc: [GL.ONE, GL.ONE_MINUS_DST_COLOR, GL.SRC_ALPHA, GL.DST_ALPHA],
        blendEquation: [GL.FUNC_SUBTRACT, GL.FUNC_ADD]
      }
    };
  }

  return {};
}

function createInteractionProps(interactionConfig) {
  const pickable = interactionConfig.tooltip.enabled;
  return {
    autoHighlight: pickable,
    pickable
  };
}

function mapProps(source, target, mapping) {
  if (Array.isArray(source)) {
    source = source[0];
  }
  for (const sourceKey in mapping) {
    const sourceValue = source[sourceKey];
    const targetKey = mapping[sourceKey];
    if (sourceValue === undefined) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (typeof targetKey === 'string') {
      target[targetKey] = sourceValue;
    } else if (typeof targetKey === 'object') {
      // Nested definition, recurse down one level
      mapProps(sourceValue, target, targetKey);
    }
  }
}

function createStyleProps(config, mapping) {
  const result = {};
  mapProps(config, result, mapping);
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
  const {textLabel, visConfig} = config;
  const result = {};
  const textLabelField = textLabel[0].field;
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
  if (textLabelField) {
    result.getText = getTextAccessor(textLabelField);
    result.pointType = 'circle+text';

    const {alignment, anchor, size} = textLabel[0];
    const padding = 20;
    const radius = visConfig.radius * 0.2;
    const signX = anchor === 'middle' ? 0 : anchor === 'start' ? 1 : -1;
    const signY = alignment === 'center' ? 0 : alignment === 'bottom' ? 1 : -1;
    const sizeOffset = alignment === 'center' ? 0 : size;
    result.getTextPixelOffset = [
      signX * (radius + padding),
      signY * (radius + padding + sizeOffset)
    ];
  }

  return result;
}
