import {Layer} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
import type {
  LayerProps,
  UpdateParameters,
  Accessor,
  Unit,
  Position,
  Color,
  DefaultProps
} from '@deck.gl/core';
/** All props supported by the ScatterplotLayer */
export declare type ScatterplotLayerProps<DataT = any> = _ScatterplotLayerProps<DataT> &
  LayerProps<DataT>;
/** Props added by the ScatterplotLayer */
declare type _ScatterplotLayerProps<DataT> = {
  /**
   * The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  radiusUnits?: Unit;
  /**
   * Radius multiplier.
   * @default 1
   */
  radiusScale?: number;
  /**
   * The minimum radius in pixels. This prop can be used to prevent the circle from getting too small when zoomed out.
   * @default 0
   */
  radiusMinPixels?: number;
  /**
   * The maximum radius in pixels. This prop can be used to prevent the circle from getting too big when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  radiusMaxPixels?: number;
  /**
   * The units of the stroke width, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;
  /**
   * Stroke width multiplier.
   * @default 1
   */
  lineWidthScale?: number;
  /**
   * The minimum stroke width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.
   * @default 0
   */
  lineWidthMinPixels?: number;
  /**
   * The maximum stroke width in pixels. This prop can be used to prevent the circle from getting too thick when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;
  /**
   * Draw the outline of points.
   * @default false
   */
  stroked?: boolean;
  /**
   * Draw the filled area of points.
   * @default true
   */
  filled?: boolean;
  /**
   * If `true`, rendered circles always face the camera. If `false` circles face up (i.e. are parallel with the ground plane).
   * @default false
   */
  billboard?: boolean;
  /**
   * If `true`, circles are rendered with smoothed edges. If `false`, circles are rendered with rough edges. Antialiasing can cause artifacts on edges of overlapping circles.
   * @default true
   */
  antialiasing?: boolean;
  /**
   * Center position accessor.
   */
  getPosition?: Accessor<DataT, Position>;
  /**
   * Radius accessor.
   * @default 1
   */
  getRadius?: Accessor<DataT, number>;
  /**
   * Fill color accessor.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
  /**
   * Stroke color accessor.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;
  /**
   * Stroke width accessor.
   * @default 1
   */
  getLineWidth?: Accessor<DataT, number>;
  /**
   * @deprecated Use `getLineWidth` instead
   */
  strokeWidth?: number;
  /**
   * @deprecated Use `stroked` instead
   */
  outline?: boolean;
  /**
   * @deprecated Use `getFillColor` and `getLineColor` instead
   */
  getColor?: Accessor<DataT, Color>;
};
/** Render circles at given coordinates. */
export default class ScatterplotLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_ScatterplotLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<ScatterplotLayerProps<any>>;
  static layerName: string;
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
}
export {};
// # sourceMappingURL=scatterplot-layer.d.ts.map
