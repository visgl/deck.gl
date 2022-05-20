import {Accessor, Color, CompositeLayerProps, Unit} from '@deck.gl/core';
import {FillProps, Polygon3DProps, StrokeProps} from '../types';

/** All properties supported by GeoJsonLayer */
export type GeoJsonLayerProps<DataT = any> = _GeoJsonLayerProps<DataT> & CompositeLayerProps<DataT>;

/** Properties added by GeoJsonLayer */
export type _GeoJsonLayerProps<DataT = any> = {
  /**
   * How to render Point and MultiPoint features in the data.
   *
   * Supported types are:
   *  * `'circle'`
   *  * `'icon'`
   *  * `'text'`
   *
   * @default 'circle'
   */
  pointType?: string;

  /** Type of line caps.
   * If `true`, draw round caps. Otherwise draw square caps.
   * @default false
   */
  lineCapRounded?: boolean;

  /**
   * If `true`, extrude the line in screen space (width always faces the camera).
   * If `false`, the width always faces up.
   *
   * @default false
   */
  lineBillboard?: boolean;

  /** @deprecated */
  getRadius?: Accessor<DataT, number>;
} & FillProps<DataT> &
  StrokeProps<DataT> &
  Polygon3DProps<DataT> &
  _GeoJsonLayerPointCircleProps<DataT> &
  _GeojsonLayerIconPointProps<DataT> &
  _GeojsonLayerTextPointProps<DataT>;

/** Properties forwarded to `ScatterPlotLayer` if `pointType` is `'circle'` */
type _GeoJsonLayerPointCircleProps<DataT = any> = {
  getPointRadius?: Accessor<DataT, number>;
  pointRadiusUnits?: Unit;
  pointRadiusScale?: number;
  pointRadiusMinPixels?: number;
  pointRadiusMaxPixels?: number;
  pointAntialiasing?: boolean;
  pointBillboard?: boolean;
};

/** Properties forwarded to `IconLayer` if `pointType` is `'icon'` */
type _GeojsonLayerIconPointProps<DataT = any> = {
  iconAtlas?: any;
  iconMapping?: any;
  getIcon?: Accessor<DataT, any>;
  getIconSize?: Accessor<DataT, number>;
  getIconColor?: Accessor<DataT, Color>;
  getIconAngle?: Accessor<DataT, number>;
  getIconPixelOffset?: Accessor<DataT, number[]>;
  iconSizeUnits?: Unit;
  iconSizeScale?: number;
  iconSizeMinPixels?: number;
  iconSizeMaxPixels?: number;
  iconBillboard?: boolean;
  iconAlphaCutoff?: number;
};

/** Properties forwarded to `TextLayer` if `pointType` is `'text'` */
type _GeojsonLayerTextPointProps<DataT = any> = {
  getText?: Accessor<DataT, any>;
  getTextColor?: Accessor<DataT, Color>;
  getTextAngle?: Accessor<DataT, number>;
  getTextSize?: Accessor<DataT, number>;
  getTextAnchor?: Accessor<DataT, string>;
  getTextAlignmentBaseline?: Accessor<DataT, string>;
  getTextPixelOffset?: Accessor<DataT, number[]>;
  getTextBackgroundColor?: Accessor<DataT, Color>;
  getTextBorderColor?: Accessor<DataT, Color>;
  getTextBorderWidth?: Accessor<DataT, number>;
  textSizeUnits?: Unit;
  textSizeScale?: number;
  textSizeMinPixels?: number;
  textSizeMaxPixels?: number;
  textCharacterSet?: any;
  textFontFamily?: string;
  textFontWeight?: number;
  textLineHeight?: number;
  textMaxWidth?: number;
  textWordBreak?: string; // TODO
  textBackground?: boolean;
  textBackgroundPadding?: number[];
  textOutlineColor?: Color;
  textOutlineWidth?: number;
  textBillboard?: boolean;
  textFontSettings?: any;
};
