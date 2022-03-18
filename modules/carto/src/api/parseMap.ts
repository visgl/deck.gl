import GL from '@luma.gl/constants';
import {
  getLayer,
  getColorAccessor,
  getSizeAccessor,
  getTextAccessor,
  getTextPixelOffsetAccessor
} from './layer-map';
import {_flatten as flatten, log} from '@deck.gl/core';
import {assert} from '../utils';

export function parseMap(json) {
  const {keplerMapConfig, datasets} = json;
  assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
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
      try {
        const {dataId} = config;
        const dataset = datasets.find(d => d.id === dataId);
        assert(dataset, `No dataset matching dataId: ${dataId}`);
        const {data} = dataset;
        assert(data, `No data loaded for dataId: ${dataId}`);
        const {Layer, propMap, defaultProps} = getLayer(type, config, dataset);
        return new Layer({
          id,
          data,
          ...defaultProps,
          ...createBlendingProps(layerBlending),
          ...(!config.textLabel && createInteractionProps(interactionConfig)),
          ...createStyleProps(config, propMap),
          ...createChannelProps(visualChannels, type, config, data) // Must come after style
        });
      } catch (e: any) {
        log.error(e.message)();
        return undefined;
      }
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
        ...textLabel
          .filter(t => t.field)
          .map(t => {
            return {
              id: `${id}-label-${t.field.name}`,
              config: {
                textLabel: t,
                ...configRest,
                label: `${config.label}-label-${t.field.name}`,
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
  for (const sourceKey in mapping) {
    const sourceValue = source[sourceKey];
    const targetKey = mapping[sourceKey];
    if (sourceValue === undefined) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (typeof targetKey === 'string') {
      target[targetKey] = sourceValue;
    } else if (typeof targetKey === 'function') {
      const [key, value] = Object.entries(targetKey(sourceValue))[0];
      target[key] = value;
    } else if (typeof targetKey === 'object') {
      // Nested definition, recurse down one level (also handles arrays)
      mapProps(sourceValue, target, targetKey);
    }
  }
}

function createStyleProps(config, mapping) {
  const result: Record<string, any> = {};
  mapProps(config, result, mapping);
  result.highlightColor = config.visConfig.enable3d ? [255, 255, 255, 60] : [252, 242, 26, 255];
  return result;
}

/* eslint-disable complexity */
function createChannelProps(visualChannels, type, config, data) {
  const {colorField, colorScale, sizeField, sizeScale, strokeColorField, strokeColorScale} =
    visualChannels;
  let {heightField, heightScale} = visualChannels;
  if (type === 'hexagonId') {
    heightField = sizeField;
    heightScale = sizeScale;
  }
  const {textLabel, visConfig} = config;
  const result: Record<string, any> = {};
  const textLabelField = textLabel && textLabel.field;
  if (colorField) {
    result.getFillColor = getColorAccessor(
      colorField,
      colorScale,
      visConfig.colorRange,
      1, // Rely on layer opacity
      data
    );
  } else if (type === 'grid' || type === 'hexagon') {
    result.colorScaleType = colorScale;
  }
  if (strokeColorField) {
    const opacity = visConfig.strokeOpacity !== undefined ? visConfig.strokeOpacity : 1;
    result.getLineColor = getColorAccessor(
      strokeColorField,
      strokeColorScale,
      visConfig.strokeColorRange,
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
