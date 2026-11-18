// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, Layer, _packNormalizedColor as packNormalizedColor} from '@deck.gl/core';

import IconLayer from '../icon-layer/icon-layer';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import TextLayer from '../text-layer/text-layer';
import PathLayer from '../path-layer/path-layer';
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';

export const POINT_LAYER = {
  circle: {
    type: ScatterplotLayer,
    props: {
      filled: 'filled',
      stroked: 'stroked',

      lineWidthMaxPixels: 'lineWidthMaxPixels',
      lineWidthMinPixels: 'lineWidthMinPixels',
      lineWidthScale: 'lineWidthScale',
      lineWidthUnits: 'lineWidthUnits',
      pointRadiusMaxPixels: 'radiusMaxPixels',
      pointRadiusMinPixels: 'radiusMinPixels',
      pointRadiusScale: 'radiusScale',
      pointRadiusUnits: 'radiusUnits',
      pointAntialiasing: 'antialiasing',
      pointBillboard: 'billboard',

      getFillColor: 'getFillColor',
      getLineColor: 'getLineColor',
      getLineWidth: 'getLineWidth',
      getPointRadius: 'getRadius'
    }
  },
  icon: {
    type: IconLayer,
    props: {
      iconAtlas: 'iconAtlas',
      iconMapping: 'iconMapping',

      iconSizeMaxPixels: 'sizeMaxPixels',
      iconSizeMinPixels: 'sizeMinPixels',
      iconSizeScale: 'sizeScale',
      iconSizeUnits: 'sizeUnits',
      iconAlphaCutoff: 'alphaCutoff',
      iconBillboard: 'billboard',

      getIcon: 'getIcon',
      getIconAngle: 'getAngle',
      getIconColor: 'getColor',
      getIconPixelOffset: 'getPixelOffset',
      getIconSize: 'getSize'
    }
  },
  text: {
    type: TextLayer,
    props: {
      textSizeMaxPixels: 'sizeMaxPixels',
      textSizeMinPixels: 'sizeMinPixels',
      textSizeScale: 'sizeScale',
      textSizeUnits: 'sizeUnits',

      textBackground: 'background',
      textBackgroundPadding: 'backgroundPadding',
      textFontFamily: 'fontFamily',
      textFontWeight: 'fontWeight',
      textLineHeight: 'lineHeight',
      textMaxWidth: 'maxWidth',
      textOutlineColor: 'outlineColor',
      textOutlineWidth: 'outlineWidth',
      textWordBreak: 'wordBreak',
      textCharacterSet: 'characterSet',
      textBillboard: 'billboard',
      textFontSettings: 'fontSettings',

      getText: 'getText',
      getTextAngle: 'getAngle',
      getTextColor: 'getColor',
      getTextPixelOffset: 'getPixelOffset',
      getTextSize: 'getSize',
      getTextAnchor: 'getTextAnchor',
      getTextAlignmentBaseline: 'getAlignmentBaseline',
      getTextBackgroundColor: 'getBackgroundColor',
      getTextBorderColor: 'getBorderColor',
      getTextBorderWidth: 'getBorderWidth'
    }
  }
};

export const LINE_LAYER = {
  type: PathLayer,
  props: {
    lineWidthUnits: 'widthUnits',
    lineWidthScale: 'widthScale',
    lineWidthMinPixels: 'widthMinPixels',
    lineWidthMaxPixels: 'widthMaxPixels',
    lineJointRounded: 'jointRounded',
    lineCapRounded: 'capRounded',
    lineMiterLimit: 'miterLimit',
    lineBillboard: 'billboard',
    lineAntialiasing: 'antialiasing',

    getLineColor: 'getColor',
    getLineWidth: 'getWidth'
  }
};

export const POLYGON_LAYER = {
  type: SolidPolygonLayer,
  props: {
    extruded: 'extruded',
    filled: 'filled',
    wireframe: 'wireframe',
    elevationScale: 'elevationScale',
    material: 'material',
    _full3d: '_full3d',

    getElevation: 'getElevation',
    getFillColor: 'getFillColor',
    getLineColor: 'getLineColor'
  }
};

export function getDefaultProps({
  type,
  props
}: {
  type: typeof Layer;
  props: Record<string, string>;
}): Record<string, any> {
  const result = {};
  for (const key in props) {
    /** GeoJSON sublayers use wrapped feature rows for styling accessors. */
    const value = type.defaultProps[props[key]];
    result[key] = value?.type === 'accessor' ? {...value, arrow: 'row'} : value;
  }
  return result;
}

/** Decode a user-supplied plain array for a child that uses byte colors. */
function encodeColor(value: unknown): unknown {
  if (!Array.isArray(value)) return value;

  const color: number[] = [];
  packNormalizedColor(value, color, 0, 4);
  return color;
}

/** Forwards GeoJSON style props and keeps child color inputs in their byte convention. */
export function forwardProps(
  layer: CompositeLayer,
  mapping: Record<string, string>,
  geometryAccessor: 'getPosition' | 'getPath' | 'getPolygon',
  normalizedColors: boolean
): Record<string, any> {
  const {transitions, updateTriggers} = layer.props;
  const defaultProps = Object.getPrototypeOf(layer.props);
  const result: Record<string, any> = {
    updateTriggers: {},
    transitions: transitions && {
      // Geometry uses different accessor names in point, path, and polygon sublayers.
      [geometryAccessor]: transitions.geometry
    }
  };

  for (const sourceKey in mapping) {
    const targetKey = mapping[sourceKey];
    let value = layer.props[sourceKey];
    if (sourceKey.startsWith('get')) {
      const isColor = sourceKey.endsWith('Color');
      const normalize = isColor && normalizedColors && value !== defaultProps[sourceKey];
      value = (layer as any).getSubLayerAccessor(value);
      if (normalize) {
        if (typeof value === 'function') {
          const accessor = value;
          value = (object, info) => encodeColor(accessor(object, info));
        } else {
          value = encodeColor(value);
        }
      }
      const trigger = updateTriggers[sourceKey];
      result.updateTriggers[targetKey] =
        normalize && typeof value === 'function'
          ? [normalize, ...(Array.isArray(trigger) ? trigger : [trigger])]
          : trigger;
      if (transitions) {
        result.transitions[targetKey] = transitions[sourceKey];
      }
    }
    if (sourceKey === 'textOutlineColor' && normalizedColors && value !== defaultProps[sourceKey]) {
      value = encodeColor(value);
    }

    result[targetKey] = value;
  }
  return result;
}
