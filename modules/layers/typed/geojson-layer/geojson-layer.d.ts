import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  PickingInfo,
  Unit,
  Material,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import type {Feature} from 'geojson';
/** All properties supported by GeoJsonLayer */
export declare type GeoJsonLayerProps<DataT extends Feature = Feature> = _GeoJsonLayerProps<DataT> &
  CompositeLayerProps<DataT>;
/** Properties added by GeoJsonLayer */
export declare type _GeoJsonLayerProps<DataT extends Feature = Feature> = {
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
} & _GeoJsonLayerFillProps<DataT> &
  _GeoJsonLayerStrokeProps<DataT> &
  _GeoJsonLayer3DProps<DataT> &
  _GeoJsonLayerPointCircleProps<DataT> &
  _GeojsonLayerIconPointProps<DataT> &
  _GeojsonLayerTextPointProps<DataT>;
/** GeoJsonLayer fill options. */
declare type _GeoJsonLayerFillProps<DataT> = {
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
declare type _GeoJsonLayerStrokeProps<DataT> = {
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
};
/** GeoJsonLayer 3D options. */
declare type _GeoJsonLayer3DProps<DataT> = {
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
   * (Experimental) This prop is only effective with `XYZ` data.
   * When true, polygon tesselation will be performed on the plane with the largest area, instead of the xy plane.
   * @default false
   */
  _full3d?: boolean;
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
   * Material settings for lighting effect. Applies to extruded polgons.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
};
/** GeoJsonLayer Properties forwarded to `ScatterPlotLayer` if `pointType` is `'circle'` */
export declare type _GeoJsonLayerPointCircleProps<DataT> = {
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
/** GeoJsonLayer properties forwarded to `IconLayer` if `pointType` is `'icon'` */
declare type _GeojsonLayerIconPointProps<DataT> = {
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
/** GeoJsonLayer properties forwarded to `TextLayer` if `pointType` is `'text'` */
declare type _GeojsonLayerTextPointProps<DataT> = {
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
  textWordBreak?: string;
  textBackground?: boolean;
  textBackgroundPadding?: number[];
  textOutlineColor?: Color;
  textOutlineWidth?: number;
  textBillboard?: boolean;
  textFontSettings?: any;
};
declare type GeoJsonPickingInfo = PickingInfo & {
  featureType?: string | null;
  info?: any;
};
/** Render GeoJSON formatted data as polygons, lines and points (circles, icons and/or texts). */
export default class GeoJsonLayer<
  DataT extends Feature = Feature,
  ExtraProps = {}
> extends CompositeLayer<Required<GeoJsonLayerProps<DataT>> & ExtraProps> {
  static layerName: string;
  static defaultProps: DefaultProps<
    GeoJsonLayerProps<
      Feature<
        import('geojson').Geometry,
        {
          [name: string]: any;
        }
      >
    >
  >;
  initializeState(): void;
  updateState({props, changeFlags}: UpdateParameters<this>): void;
  private _updateStateBinary;
  private _updateStateJSON;
  getPickingInfo(params: any): GeoJsonPickingInfo;
  _updateAutoHighlight(info: GeoJsonPickingInfo): void;
  private _renderPolygonLayer;
  private _renderLineLayers;
  private _renderPointLayers;
  renderLayers(): (Layer<{}> | (false | Layer<{}>)[])[];
  protected getSubLayerAccessor<In, Out>(accessor: Accessor<In, Out>): Accessor<In, Out>;
}
export {};
// # sourceMappingURL=geojson-layer.d.ts.map
