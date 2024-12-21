import {
  Layer,
  LayerProps,
  UpdateParameters,
  Unit,
  AccessorFunction,
  Position,
  Accessor,
  Color,
  Material,
  DefaultProps
} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
import ColumnGeometry from './column-geometry';
/** All properties supported by ColumnLayer. */
export declare type ColumnLayerProps<DataT = any> = _ColumnLayerProps<DataT> & LayerProps<DataT>;
/** Properties added by ColumnLayer. */
declare type _ColumnLayerProps<DataT> = {
  /**
   * The number of sides to render the disk as.
   * @default 20
   */
  diskResolution?: number;
  /**
   * isk size in units specified by `radiusUnits`.
   * @default 1000
   */
  radius?: number;
  /**
   * Disk rotation, counter-clockwise in degrees.
   * @default 0
   */
  angle?: number;
  /**
   * Replace the default geometry (regular polygon that fits inside the unit circle) with a custom one.
   * @default null
   */
  vertices: Position[] | null;
  /**
   * Disk offset from the position, relative to the radius.
   * @default [0,0]
   */
  offset?: [number, number];
  /**
   * Radius multiplier, between 0 - 1
   * @default 1
   */
  coverage?: number;
  /**
   * Column elevation multiplier.
   * @default 1
   */
  elevationScale?: number;
  /**
   * Whether to draw a filled column (solid fill).
   * @default true
   */
  filled?: boolean;
  /**
   * Whether to draw an outline around the disks.
   * @default false
   */
  stroked?: boolean;
  /**
   * Whether to extrude the columns. If set to `false`, all columns will be rendered as flat polygons.
   * @default true
   */
  extruded?: boolean;
  /**
   * Whether to generate a line wireframe of the column.
   * @default false
   */
  wireframe?: boolean;
  /**
   * If `true`, the vertical surfaces of the columns use [flat shading](https://en.wikipedia.org/wiki/Shading#Flat_vs._smooth_shading).
   * @default false
   */
  flatShading?: boolean;
  /**
   * The units of the radius.
   * @default 'meters'
   */
  radiusUnits?: Unit;
  /**
   * The units of the line width.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;
  /**
   * The line width multiplier that multiplied to all outlines.
   * @default 1
   */
  lineWidthScale?: number;
  /**
   * The minimum outline width in pixels.
   * @default 0
   */
  lineWidthMinPixels?: number;
  /**
   * The maximum outline width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;
  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
  /**
   * Method called to retrieve the position of each column.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;
  /**
   * @deprecated Use getFilledColor and getLineColor instead
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Fill collor value or accessor.
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
   * The elevation of each cell in meters.
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;
  /**
   * The width of the outline of the column, in units specified by `lineWidthUnits`.
   *
   * @default 1
   */
  getLineWidth?: Accessor<DataT, number>;
};
/** Render extruded cylinders (tessellated regular polygons) at given coordinates. */
export default class ColumnLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_ColumnLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<ColumnLayerProps<any>>;
  getShaders(): any;
  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  getGeometry(
    diskResolution: number,
    vertices: number[] | undefined,
    hasThinkness: boolean
  ): ColumnGeometry;
  protected _getModel(): Model;
  protected _updateGeometry({
    diskResolution,
    vertices,
    extruded,
    stroked
  }: {
    diskResolution: any;
    vertices: any;
    extruded: any;
    stroked: any;
  }): void;
  draw({uniforms}: {uniforms: any}): void;
}
export {};
// # sourceMappingURL=column-layer.d.ts.map
