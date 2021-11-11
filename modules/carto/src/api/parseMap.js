import GL from '@luma.gl/constants';
import {
  LAYER_MAP,
  getColorAccessor,
  getSizeAccessor,
  getTextAccessor,
  getTextPixelOffsetAccessor
} from './layer-map';
import {_flatten as flatten, log} from '@deck.gl/core';

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
    initialViewState: mapState,
    mapStyle,
    layers: extractTextLayers(layers.reverse()).map(({id, type, config, visualChannels}) => {
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
        ...(!config.textLabel && createInteractionProps(interactionConfig)),
        ...createStyleProps(config, propMap),
        ...createChannelProps(visualChannels, type, config, data) // Must come after style
      });
    })
  };
}

function extractTextLayers(layers) {
  return flatten(
    layers.map(({id, config, ...rest}) => {
      const {textLabel, ...configRest} = config;
      return [
        // Original layer without textLabel
        {id, config: configRest, ...rest},

        // One layer per valid text label, with full opacity
        ...textLabel.filter(t => t.field).map(t => {
          return {
            id: `${id}-label-${t.field.name}`,
            config: {
              textLabel: t,
              ...configRest,
              visConfig: {...configRest.visConfig, opacity: 1}
            },
            ...rest
          };
        })
      ];
    })
  );
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
  const pickable = interactionConfig && interactionConfig.tooltip.enabled;
  return {
    autoHighlight: pickable,
    pickable
  };
}

function mapProps(source, target, mapping) {
  if (Array.isArray(source)) {
    source = source[0];
  }
  if (!source) {
    return;
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
  result.highlightColor = config.visConfig.enable3d ? [255, 255, 255, 60] : [252, 242, 26, 255];
  return result;
}

/* eslint-disable complexity */
function createChannelProps(visualChannels, type, config, data) {
  const {
    colorField,
    colorScale,
    sizeField,
    sizeScale,
    strokeColorField,
    strokeColorScale
  } = visualChannels;
  let {heightField, heightScale} = visualChannels;
  if (type === 'hexagonId') {
    heightField = sizeField;
    heightScale = sizeScale;
  }
  const {textLabel, visConfig} = config;
  const result = {};
  const textLabelField = textLabel && textLabel.field;
  if (colorField) {
    result.getFillColor = getColorAccessor(
      colorField,
      colorScale,
      visConfig.colorRange,
      1, // Rely on layer opacity
      data
    );
  }
  if (strokeColorField) {
    const opacity =
      visConfig.strokeOpacity !== undefined ? visConfig.strokeOpacity / visConfig.opacity : 1;
    result.getLineColor = getColorAccessor(
      strokeColorField,
      strokeColorScale,
      visConfig.colorRange,
      opacity,
      data
    );
  }
  if (heightField) {
    result.getElevation = getSizeAccessor(
      heightField,
      heightScale,
      visConfig.heightRange || visConfig.sizeRange,
      data
    );
  }
  if (sizeField) {
    result.getPointRadius = getSizeAccessor(
      sizeField,
      sizeScale,
      visConfig.radiusRange || visConfig.sizeRange,
      data
    );
  }
  if (textLabelField) {
    result.getText = getTextAccessor(textLabelField, data);
    result.pointType = 'text';
    const radius = result.getPointRadius || visConfig.radius;
    result.getTextPixelOffset = getTextPixelOffsetAccessor(textLabel, radius);
  }

  return result;
}
