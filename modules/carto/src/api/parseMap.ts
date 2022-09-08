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
  SCALE_TYPE,
  getIconUrlAccessor,
  getIdentityAccessor
} from './layer-map';
import {_flatten as flatten, log, Accessor} from '@deck.gl/core';
import {assert} from '../utils';

type VisualChannelField = {
  name: string;
  type: string;
};

type VisualChannels = {
  colorField?: VisualChannelField;
  colorScale?: SCALE_TYPE;

  customMarkersField?: VisualChannelField;
  customMarkersScale?: SCALE_TYPE;

  rotationScale?: SCALE_TYPE;
  rotationField?: VisualChannelField;

  sizeField?: VisualChannelField;
  sizeScale?: SCALE_TYPE;

  strokeColorField?: VisualChannelField;
  strokeColorScale?: SCALE_TYPE;

  heightField?: VisualChannelField;
  heightScale?: SCALE_TYPE;
};

type ColorRange = {
  category: string;
  colors: string[];
  colorMap: string[][] | undefined;
  name: string;
  type: string;
};

type LayerConfig = {
  color?: number[];
  textLabel: {
    field: VisualChannelField;
    alignment: unknown;
    anchor: unknown;
    size: unknown;
  };
  visConfig: {
    filled?: boolean;
    opacity?: number;

    colorAggregation?: any;
    colorRange: ColorRange;

    customMarkers: boolean;
    customMarkersRange?: {
      markerMap?: {
        value: string | null;
        markerUrl?: string;
      }[];
      othersMarker?: string;
    };
    customMarkersUrl?: string | null;

    radius?: number;
    radiusRange?: number;

    sizeAggregation?: any;
    sizeRange?: any;

    strokeColorAggregation?: any;
    strokeOpacity?: number;
    strokeColorRange?: ColorRange;

    heightRange?: any;
    heightAggregation?: any;
  };
};

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

function getMaxMarkerSize(config: LayerConfig, visualChannels: VisualChannels): number {
  // Layer config
  const {visConfig} = config;
  const {sizeField} = visualChannels;
  const {radiusRange, radius} = visConfig;
  return Math.ceil(radiusRange && sizeField ? radiusRange[1] : radius ? radius : 8);
}

export function negateAccessor<T>(accessor: Accessor<T, number>): Accessor<T, number> {
  return typeof accessor === 'function' ? (d, i) => -accessor(d, i) : -accessor;
}

/* eslint-disable complexity, max-statements */
function createChannelProps(
  visualChannels: VisualChannels,
  type: string,
  config: LayerConfig,
  data
) {
  const {colorField, colorScale, sizeField, sizeScale, strokeColorField, strokeColorScale} =
    visualChannels;
  let {heightField, heightScale} = visualChannels;
  if (type === 'hexagonId') {
    heightField = sizeField;
    heightScale = sizeScale;
  }
  const {textLabel, visConfig} = config;
  let result: Record<string, any> = {};
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

  if (sizeField) {
    result.getPointRadius = getSizeAccessor(
      sizeField,
      // @ts-ignore
      sizeScale,
      visConfig.sizeAggregation,
      visConfig.radiusRange || visConfig.sizeRange,
      data
    );
  }

  if (
    !textLabelField &&
    visConfig.customMarkers &&
    (Boolean(visConfig.customMarkersUrl) || visualChannels.customMarkersField)
  ) {
    const maxIconSize = getMaxMarkerSize(config, visualChannels);
    const {getPointRadius, getFillColor} = result;
    result = {
      pointType: 'icon',
      getIcon: getIconUrlAccessor(
        visualChannels.customMarkersField,
        visConfig.customMarkersUrl,
        visConfig.customMarkersRange,
        maxIconSize,
        data
      ),
      _subLayerProps: {
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
      }
    };

    if (getFillColor) {
      result.getIconColor = getFillColor;
    } else if (config.color) {
      result.getIconColor = config.color;
    }

    if (getPointRadius) {
      result.getIconSize = getPointRadius;
    } else if (visConfig.radius) {
      result.getIconSize = visConfig.radius;
    }

    if (visualChannels.rotationField) {
      result.getIconAngle = negateAccessor(
        getIdentityAccessor(visualChannels.rotationField.name, null, data)
      );
    }
    return result;
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
  }

  return result;
}
