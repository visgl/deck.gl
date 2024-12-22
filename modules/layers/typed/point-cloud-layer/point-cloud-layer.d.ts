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
/** All properties supported by PointCloudLayer. */
export declare type PointCloudLayerProps<DataT = any> = _PointCloudLayerProps<DataT> &
  LayerProps<DataT>;
/** Properties added by PointCloudLayer. */
declare type _PointCloudLayerProps<DataT> = {
  /**
   * The units of the point size, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'pixels'
   */
  sizeUnits?: Unit;
  /**
   * Global radius of all points, in units specified by `sizeUnits`
   * @default 10
   */
  pointSize?: number;
  /**
   * @deprecated Use `pointSize` instead
   */
  radiusPixels?: number;
  /**
   * Material settings for lighting effect.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;
  /**
   * The normal of each object, in `[nx, ny, nz]`.
   * @default [0, 0, 1]
   */
  getNormal?: Accessor<DataT, [number, number, number]>;
  /**
   * The rgba color is in the format of `[r, g, b, [a]]`
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
};
/** Render a point cloud with 3D positions, normals and colors. */
export default class PointCloudLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_PointCloudLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<PointCloudLayerProps<any>>;
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
}
export {};
// # sourceMappingURL=point-cloud-layer.d.ts.map
