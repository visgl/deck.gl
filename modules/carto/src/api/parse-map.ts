// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ColorParameters} from '@luma.gl/core';
import {Layer, log} from '@deck.gl/core';
import {
  AGGREGATION,
  getLayer,
  getColorAccessor,
  getColorValueAccessor,
  getSizeAccessor,
  getTextAccessor,
  OPACITY_MAP,
  opacityToAlpha,
  getIconUrlAccessor,
  negateAccessor,
  getMaxMarkerSize
} from './layer-map';
import PointLabelLayer from '../layers/point-label-layer';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {assert} from '../utils';
import {KeplerMapConfig, MapDataset, MapLayerConfig, VisualChannels} from './types';

const collisionFilterExtension = new CollisionFilterExtension();

export type ParseMapResult = {
  /** Map id. */
  id: string;

  /** Title of map. */
  title: string;

  /** Description of map. */
  description?: string;
  createdAt: string;
  updatedAt: string;
  initialViewState: any;

  /** @deprecated Use `basemap`. */
  mapStyle: any;
  token: string;

  layers: Layer[];
};

export function parseMap(json) {
  const {keplerMapConfig, datasets, token} = json;
  assert(keplerMapConfig.version === 'v1', 'Only support Kepler v1');
  const {mapState, mapStyle} = keplerMapConfig.config as KeplerMapConfig;
  const {layers, layerBlending, interactionConfig} = keplerMapConfig.config.visState;

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    initialViewState: mapState,
    /** @deprecated Use `basemap`. */
    mapStyle,
    token,
    layers: layers.reverse().map(({id, type, config, visualChannels}) => {
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
          ...createInteractionProps(interactionConfig),
          ...styleProps,
          ...createChannelProps(id, type, config, visualChannels, data), // Must come after style
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

function createParametersProp(layerBlending: string, parameters: ColorParameters) {
  if (layerBlending === 'additive') {
    parameters.blendColorSrcFactor = parameters.blendAlphaSrcFactor = 'src-alpha';
    parameters.blendColorDstFactor = parameters.blendAlphaDstFactor = 'dst-alpha';
    parameters.blendColorOperation = parameters.blendAlphaOperation = 'add';
  } else if (layerBlending === 'subtractive') {
    parameters.blendColorSrcFactor = 'one';
    parameters.blendColorDstFactor = 'one-minus-dst-color';
    parameters.blendAlphaSrcFactor = 'src-alpha';
    parameters.blendAlphaDstFactor = 'dst-alpha';
    parameters.blendColorOperation = 'subtract';
    parameters.blendAlphaOperation = 'add';
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

function createStyleProps(config: MapLayerConfig, mapping) {
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
  id: string,
  type: string,
  config: MapLayerConfig,
  visualChannels: VisualChannels,
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
    strokeColorScale,
    weightField
  } = visualChannels;
  let {heightField, heightScale} = visualChannels;
  if (type === 'hexagonId') {
    heightField = sizeField;
    heightScale = sizeScale;
  }
  const {textLabel, visConfig} = config;
  const result: Record<string, any> = {};

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
  if (heightField && visConfig.enable3d) {
    result.getElevation = getSizeAccessor(
      heightField,
      // @ts-ignore
      heightScale,
      visConfig.heightAggregation,
      visConfig.heightRange || visConfig.sizeRange,
      data
    );
  }

  if (weightField) {
    result.getWeight = getSizeAccessor(
      weightField,
      undefined,
      visConfig.weightAggregation,
      undefined,
      data
    );
  }

  if (visConfig.customMarkers) {
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
  } else if (type === 'point' || type === 'tileset') {
    result.pointType = 'circle';
  }

  if (textLabel && textLabel.length && textLabel[0].field) {
    const [mainLabel, secondaryLabel] = textLabel;
    const collisionGroup = id;

    ({
      alignment: result.getTextAlignmentBaseline,
      anchor: result.getTextAnchor,
      color: result.getTextColor,
      outlineColor: result.textOutlineColor,
      size: result.textSizeScale
    } = mainLabel);
    const {
      color: getSecondaryColor,
      field: secondaryField,
      outlineColor: secondaryOutlineColor,
      size: secondarySizeScale
    } = secondaryLabel || {};

    result.getText = mainLabel.field && getTextAccessor(mainLabel.field, data);
    const getSecondaryText = secondaryField && getTextAccessor(secondaryField, data);

    result.pointType = `${result.pointType}+text`;
    result.textCharacterSet = 'auto';
    result.textFontFamily = 'Inter, sans';
    result.textFontSettings = {sdf: true};
    result.textFontWeight = 600;
    result.textOutlineWidth = 3;

    result._subLayerProps = {
      ...result._subLayerProps,
      'points-text': {
        type: PointLabelLayer,
        extensions: [collisionFilterExtension],
        collisionEnabled: true,
        collisionGroup,

        // getPointRadius already has radiusScale baked in, so only pass one or the other
        ...(result.getPointRadius
          ? {getRadius: result.getPointRadius}
          : {radiusScale: visConfig.radius}),

        ...(secondaryField && {
          getSecondaryText,
          getSecondaryColor,
          secondarySizeScale,
          secondaryOutlineColor
        })
      }
    };
  }

  return result;
}

function createLoadOptions(accessToken: string) {
  return {
    loadOptions: {fetch: {headers: {Authorization: `Bearer ${accessToken}`}}}
  };
}
