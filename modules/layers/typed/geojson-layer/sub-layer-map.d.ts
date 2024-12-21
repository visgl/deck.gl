import {CompositeLayer, Layer} from '@deck.gl/core';
import IconLayer from '../icon-layer/icon-layer';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import TextLayer from '../text-layer/text-layer';
import PathLayer from '../path-layer/path-layer';
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
export declare const POINT_LAYER: {
  circle: {
    type: typeof ScatterplotLayer;
    props: {
      filled: string;
      stroked: string;
      lineWidthMaxPixels: string;
      lineWidthMinPixels: string;
      lineWidthScale: string;
      lineWidthUnits: string;
      pointRadiusMaxPixels: string;
      pointRadiusMinPixels: string;
      pointRadiusScale: string;
      pointRadiusUnits: string;
      pointAntialiasing: string;
      pointBillboard: string;
      getFillColor: string;
      getLineColor: string;
      getLineWidth: string;
      getPointRadius: string;
    };
  };
  icon: {
    type: typeof IconLayer;
    props: {
      iconAtlas: string;
      iconMapping: string;
      iconSizeMaxPixels: string;
      iconSizeMinPixels: string;
      iconSizeScale: string;
      iconSizeUnits: string;
      iconAlphaCutoff: string;
      iconBillboard: string;
      getIcon: string;
      getIconAngle: string;
      getIconColor: string;
      getIconPixelOffset: string;
      getIconSize: string;
    };
  };
  text: {
    type: typeof TextLayer;
    props: {
      textSizeMaxPixels: string;
      textSizeMinPixels: string;
      textSizeScale: string;
      textSizeUnits: string;
      textBackground: string;
      textBackgroundPadding: string;
      textFontFamily: string;
      textFontWeight: string;
      textLineHeight: string;
      textMaxWidth: string;
      textOutlineColor: string;
      textOutlineWidth: string;
      textWordBreak: string;
      textCharacterSet: string;
      textBillboard: string;
      textFontSettings: string;
      getText: string;
      getTextAngle: string;
      getTextColor: string;
      getTextPixelOffset: string;
      getTextSize: string;
      getTextAnchor: string;
      getTextAlignmentBaseline: string;
      getTextBackgroundColor: string;
      getTextBorderColor: string;
      getTextBorderWidth: string;
    };
  };
};
export declare const LINE_LAYER: {
  type: typeof PathLayer;
  props: {
    lineWidthUnits: string;
    lineWidthScale: string;
    lineWidthMinPixels: string;
    lineWidthMaxPixels: string;
    lineJointRounded: string;
    lineCapRounded: string;
    lineMiterLimit: string;
    lineBillboard: string;
    getLineColor: string;
    getLineWidth: string;
  };
};
export declare const POLYGON_LAYER: {
  type: typeof SolidPolygonLayer;
  props: {
    extruded: string;
    filled: string;
    wireframe: string;
    elevationScale: string;
    material: string;
    _full3d: string;
    getElevation: string;
    getFillColor: string;
    getLineColor: string;
  };
};
export declare function getDefaultProps({
  type,
  props
}: {
  type: typeof Layer;
  props: Record<string, string>;
}): Record<string, any>;
export declare function forwardProps(
  layer: CompositeLayer,
  mapping: Record<string, string>
): Record<string, any>;
// # sourceMappingURL=sub-layer-map.d.ts.map
