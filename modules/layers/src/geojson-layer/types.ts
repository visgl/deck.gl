import {Accessor, Color, CompositeLayerProps, Unit} from '@deck.gl/core';
import {MaterialProps} from '../types';

/** All properties supported by GeoJsonLayer */
export type GeoJsonLayerProps<DataT = any> = _GeoJsonLayerProps<DataT> & CompositeLayerProps<DataT>;

/** Properties added by GeoJsonLayer */
export type _GeoJsonLayerProps<DataT = any> = _GeoJsonLayerFillProps<DataT> &
  _GeoJsonLayerStrokeProps<DataT> &
  _GeoJsonLayer3DProps<DataT> &
  _GeoJsonLayerPointCircleProps<DataT> &
  _GeojsonLayerIconPointProps<DataT> &
  _GeojsonLayerTextPointProps<DataT> & {
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
  };

/** GeoJsonLayer fill options. */
type _GeoJsonLayerFillProps<DataT> = {
  /**
   * Whether to draw a filled polygon (solid fill).
   *
   * Note that only the area between the outer polygon and any holes will be filled.
   *
   * @default true
   */
  filled?: boolean;

  /**
   * Fill collor value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
};

/** GeoJsonLayer stroke options. */
type _GeoJsonLayerStrokeProps<DataT> = {
  /**
   * Whether to draw an outline around the polygon (solid fill).
   *
   * Note that both the outer polygon as well the outlines of any holes will be drawn.
   *
   * @default true
   */
  stroked?: boolean;

  /**
   * Line color value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;

  /**
   * Line width value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineWidth?: Accessor<DataT, number>;

  /**
   * The units of the line width, one of `meters`, `common`, and `pixels`.
   *
   * @default 'meters'
   * @see Unit.
   */
  lineWidthUnits?: Unit;

  /**
   * A multiplier that is applied to all line widths
   *
   * @default 1
   */
  lineWidthScale?: number;

  /**
   * The minimum line width in pixels.
   *
   * @default 0
   */
  lineWidthMinPixels?: number;

  /**
   * The maximum line width in pixels
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Type of joint. If `true`, draw round joints. Otherwise draw miter joints.
   *
   * @default false
   */
  lineJointRounded?: boolean;

  /**
   * The maximum extent of a joint in ratio to the stroke width.
   *
   * Only works if `lineJointRounded` is false.
   *
   * @default 4
   */
  lineMiterLimit?: number;

  /**
   * Type of line caps.
   *
   * If `true`, draw round caps. Otherwise draw square caps.
   *
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

  /**
   * This property has been moved to `PathStyleExtension`.
   *
   * @deprecated
   */
  getLineDashArray?: Accessor<DataT, number> | null;
};

/** GeoJsonLayer 3D options. */
type _GeoJsonLayer3DProps<DataT = any> = {
  /**
   * Extrude Polygon and MultiPolygon features along the z-axis if set to true
   *
   * Based on the elevations provided by the `getElevation` accessor.
   *
   * @default false
   */
  extruded?: boolean;

  /**
   * Whether to generate a line wireframe of the hexagon.
   *
   * @default false
   */
  wireframe?: boolean;

  /**
   * Elevation valur or accessor.
   *
   * Only used if `extruded: true`.
   *
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;

  /**
   * Elevation multiplier.
   *
   * The final elevation is calculated by `elevationScale * getElevation(d)`.
   * `elevationScale` is a handy property to scale all elevation without updating the data.
   *
   * @default 1
   */
  elevationScale?: boolean;

  /**
   * Material props for lighting effect.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting#constructing-a-material-instance
   */
  material?: true | MaterialProps | null;
};

/** Properties forwarded to `ScatterPlotLayer` if `pointType` is `'circle'` */
type _GeoJsonLayerPointCircleProps<DataT = any> = {
  getPointRadius?: Accessor<DataT, number>;
  pointRadiusUnits?: Unit;
  pointRadiusScale?: number;
  pointRadiusMinPixels?: number;
  pointRadiusMaxPixels?: number;
  pointAntialiasing?: boolean;
  pointBillboard?: boolean;

  /** @deprecated use getPointRadius */
  getRadius?: Accessor<DataT, number>;
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
