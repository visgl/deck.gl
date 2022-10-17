import GL from '@luma.gl/constants';
import {
  AGGREGATION,
  getLayer,
  getColorAccessor,
  getColorValueAccessor,
  getSizeAccessor,
  getTextAccessor,
  getTextPixelOffsetAccessor,
  OPACITY_MAP,
  opacityToAlpha,
  getIconUrlAccessor,
  negateAccessor,
  getMaxMarkerSize
} from './layer-map';
import {_flatten as flatten, log} from '@deck.gl/core';
import {assert} from '../utils';
import {MapDataset, MapTextSubLayerConfig, VisualChannels} from './types';

export function parseMap(json) {
  const {keplerMapConfig, datasets, token} = json;
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
    token,
    layers: extractTextLayers(layers.reverse()).map(({id, type, config, visualChannels}) => {
      try {
        const {dataId} = config;
        const dataset: MapDataset | null = datasets.find(d => d.id === dataId);
        assert(dataset, `No dataset matching dataId: ${dataId}`);
        const {data} = dataset;
        assert(data, `No data loaded for dataId: ${dataId}`);
        const {Layer, propMap, defaultProps} = getLayer(type, config, dataset);
        const styleProps = createStyleProps(config, propMap);
        return new Layer({
          id,
          data,
          ...defaultProps,
          ...(!config.textLabel && createInteractionProps(interactionConfig)),
          ...styleProps,
          ...createChannelProps(visualChannels, type, config, data), // Must come after style
          ...createParametersProp(layerBlending, styleProps.parameters || {}), // Must come after style
          ...createLoadOptions(token)
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

function createParametersProp(layerBlending, parameters: Record<string, any>) {
  if (layerBlending === 'additive') {
    parameters.blendFunc = [GL.SRC_ALPHA, GL.DST_ALPHA];
    parameters.blendEquation = GL.FUNC_ADD;
  } else if (layerBlending === 'subtractive') {
    parameters.blendFunc = [GL.ONE, GL.ONE_MINUS_DST_COLOR, GL.SRC_ALPHA, GL.DST_ALPHA];
    parameters.blendEquation = [GL.FUNC_SUBTRACT, GL.FUNC_ADD];
  }

  return Object.keys(parameters).length ? {parameters} : {};
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

function createStyleProps(config: MapTextSubLayerConfig, mapping) {
  const result: Record<string, any> = {};
  mapProps(config, result, mapping);

  // Kepler format sometimes omits strokeColor. TODO: remove once we can rely on
  // `strokeColor` always being set when `stroke: true`.
  if (result.stroked && !result.getLineColor) {
    result.getLineColor = result.getFillColor;
  }

  for (const colorAccessor in OPACITY_MAP) {
    if (Array.isArray(result[colorAccessor])) {
      const color = [...result[colorAccessor]];
      const opacityKey = OPACITY_MAP[colorAccessor];
      const opacity = config.visConfig[opacityKey];
      color[3] = opacityToAlpha(opacity);
      result[colorAccessor] = color;
    }
  }

  result.highlightColor = config.visConfig.enable3d ? [255, 255, 255, 60] : [252, 242, 26, 255];
  return result;
}

/* eslint-disable complexity, max-statements */
function createChannelProps(
  visualChannels: VisualChannels,
  type: string,
  config: MapTextSubLayerConfig,
  data
) {
  const {
    colorField,
    colorScale,
    radiusField,
    radiusScale,
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
  const result: Record<string, any> = {};
  const textLabelField = textLabel && textLabel.field;

  if (type === 'grid' || type === 'hexagon') {
    result.colorScaleType = colorScale;
    if (colorField) {
      const {colorAggregation} = config.visConfig;
      if (!AGGREGATION[colorAggregation]) {
        result.getColorValue = getColorValueAccessor(colorField, colorAggregation, data);
      } else {
        result.getColorWeight = d => d[colorField.name];
      }
    }
  } else if (colorField) {
    const {colorAggregation: aggregation, colorRange: range} = visConfig;
    result.getFillColor = getColorAccessor(
      colorField,
      // @ts-ignore
      colorScale,
      {aggregation, range},
      visConfig.opacity,
      data
    );
  }

  if (type === 'point') {
    const altitude = config.columns?.altitude;
    if (altitude) {
      result.dataTransform = data => {
        data.features.forEach(({geometry, properties}) => {
          const {type, coordinates} = geometry;
          if (type === 'Point') {
            coordinates[2] = properties[altitude];
          }
        });
        return data;
      };
    }
  }

  if (radiusField || sizeField) {
    result.getPointRadius = getSizeAccessor(
      // @ts-ignore
      radiusField || sizeField,
      // @ts-ignore
      radiusScale || sizeScale,
      visConfig.sizeAggregation,
      visConfig.radiusRange || visConfig.sizeRange,
      data
    );
  }

  if (strokeColorField) {
    const fallbackOpacity = type === 'point' ? visConfig.opacity : 1;
    const opacity =
      visConfig.strokeOpacity !== undefined ? visConfig.strokeOpacity : fallbackOpacity;
    const {strokeColorAggregation: aggregation, strokeColorRange: range} = visConfig;
    result.getLineColor = getColorAccessor(
      strokeColorField,
      // @ts-ignore
      strokeColorScale,
      // @ts-ignore
      {aggregation, range},
      opacity,
      data
    );
  }

  if (heightField) {
    result.getElevation = getSizeAccessor(
      heightField,
      // @ts-ignore
      heightScale,
      visConfig.heightAggregation,
      visConfig.heightRange || visConfig.sizeRange,
      data
    );
  }

  if (textLabelField) {
    result.getText = getTextAccessor(textLabelField, data);
    result.pointType = 'text';
    const radius = result.getPointRadius || visConfig.radius;
    result.getTextPixelOffset = getTextPixelOffsetAccessor(textLabel, radius);
  } else if (visConfig.customMarkers) {
    const maxIconSize = getMaxMarkerSize(visConfig, visualChannels);
    const {getPointRadius, getFillColor} = result;
    const {customMarkersUrl, customMarkersRange, filled: useMaskedIcons} = visConfig;

    result.pointType = 'icon';
    result.getIcon = getIconUrlAccessor(
      visualChannels.customMarkersField,
      customMarkersRange,
      {fallbackUrl: customMarkersUrl, maxIconSize, useMaskedIcons},
      data
    );
    result._subLayerProps = {
      'points-icon': {
        loadOptions: {
          image: {
            type: 'imagebitmap'
          },
          imagebitmap: {
            resizeWidth: maxIconSize,
            resizeHeight: maxIconSize,
            resizeQuality: 'high'
          }
        }
      }
    };

    if (getFillColor && useMaskedIcons) {
      result.getIconColor = getFillColor;
    }

    if (getPointRadius) {
      result.getIconSize = getPointRadius;
    }

    if (visualChannels.rotationField) {
      result.getIconAngle = negateAccessor(
        getSizeAccessor(visualChannels.rotationField, undefined, null, undefined, data)
      );
    }
  }

  return result;
}

function createLoadOptions(accessToken: string) {
  return {
    loadOptions: {fetch: {headers: {Authorization: `Bearer ${accessToken}`}}}
  };
}
