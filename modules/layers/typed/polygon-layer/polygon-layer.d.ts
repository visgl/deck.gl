import {
  Accessor,
  AccessorFunction,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  Unit,
  Material,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
/**
 * All properties supported by `PolygonLayer`.
 */
export declare type PolygonLayerProps<DataT = any> = _PolygonLayerProps<DataT> &
  CompositeLayerProps<DataT>;
/**
 * Properties added by `PolygonLayer`.
 */
declare type _PolygonLayerProps<DataT = any> = {
  /**
   * Whether to draw an outline around the polygon (solid fill).
   *
   * Note that both the outer polygon as well the outlines of any holes will be drawn.
   *
   * @default true
   */
  stroked?: boolean;
  /**
   * Whether to draw a filled polygon (solid fill).
   *
   * Note that only the area between the outer polygon and any holes will be filled.
   *
   * @default true
   */
  filled?: boolean;
  /**
   * Whether to extrude the polygons.
   *
   * Based on the elevations provided by the `getElevation` accessor.
   *
   * If set to `false`, all polygons will be flat, this generates less geometry and is faster
   * than simply returning 0 from getElevation.
   *
   * @default false
   */
  extruded?: boolean;
  /**
   * Elevation multiplier.
   *
   * The final elevation is calculated by `elevationScale * getElevation(d)`.
   * `elevationScale` is a handy property to scale all elevation without updating the data.
   *
   * @default 1
   */
  elevationScale?: number;
  /**
   * Whether to generate a line wireframe of the hexagon.
   *
   * The outline will have "horizontal" lines closing the top and bottom polygons and a vertical
   * line (a "strut") for each vertex on the polygon.
   *
   * @default false
   */
  wireframe?: boolean;
  /**
   * The units of the line width, one of `meters`, `common`, and `pixels`.
   *
   * @default 'meters'
   * @see Unit.
   */
  lineWidthUnits?: Unit;
  /**
   * The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
   * features if the stroked attribute is true.
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
  lineDashJustified?: boolean;
  /** Called on each object in the data stream to retrieve its corresponding polygon. */
  getPolygon?: AccessorFunction<DataT, any>;
  /**
   * Fill collor value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
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
   * Elevation valur or accessor.
   *
   * Only used if `extruded: true`.
   *
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;
  /**
   * This property has been moved to `PathStyleExtension`.
   *
   * @deprecated
   */
  getLineDashArray?: Accessor<DataT, number> | null;
  /**
   * If `false`, will skip normalizing the coordinates returned by `getPolygon`.
   *
   * **Note**: This prop is experimental
   *
   * @default true
   */
  _normalize?: boolean;
  /**
   * Specifies the winding order of rings in the polygon data.
   *
   * **Note**: This prop is experimental
   *
   * @default 'CW'
   */
  _windingOrder?: 'CW' | 'CCW';
  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
};
/** A composite layer that renders filled, stroked and/or extruded polygons. */
export default class PolygonLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  Required<_PolygonLayerProps<DataT>> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<PolygonLayerProps<any>>;
  initializeState(): void;
  updateState({changeFlags}: UpdateParameters<this>): void;
  private _getPaths;
  renderLayers(): Layer | null | LayersList;
}
export {};
// # sourceMappingURL=polygon-layer.d.ts.map
