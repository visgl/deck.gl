import {Layer} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
import PolygonTesselator from './polygon-tesselator';
import type {
  LayerProps,
  Color,
  Material,
  Accessor,
  AccessorFunction,
  UpdateParameters,
  GetPickingInfoParams,
  PickingInfo,
  DefaultProps
} from '@deck.gl/core';
import type {PolygonGeometry} from './polygon';
declare type _SolidPolygonLayerProps<DataT> = {
  /** Whether to fill the polygons
   * @default true
   */
  filled?: boolean;
  /** Whether to extrude the polygons
   * @default false
   */
  extruded?: boolean;
  /** Whether to generate a line wireframe of the polygon.
   * @default false
   */
  wireframe?: boolean;
  /**
   * (Experimental) If `false`, will skip normalizing the coordinates returned by `getPolygon`.
   * @default true
   */
  _normalize?: boolean;
  /**
   * (Experimental) This prop is only effective with `_normalize: false`.
   * It specifies the winding order of rings in the polygon data, one of 'CW' (clockwise) and 'CCW' (counter-clockwise)
   */
  _windingOrder?: 'CW' | 'CCW';
  /**
   * (Experimental) This prop is only effective with `XYZ` data.
   * When true, polygon tesselation will be performed on the plane with the largest area, instead of the xy plane.
   * @default false
   */
  _full3d?: boolean;
  /** Elevation multiplier.
   * @default 1
   */
  elevationScale?: number;
  /** Polygon geometry accessor. */
  getPolygon?: AccessorFunction<DataT, PolygonGeometry>;
  /** Extrusion height accessor.
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;
  /** Fill color accessor.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
  /** Stroke color accessor.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;
  /**
   * Material settings for lighting effect. Applies if `extruded: true`
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
};
/** Render filled and/or extruded polygons. */
export declare type SolidPolygonLayerProps<DataT = any> = _SolidPolygonLayerProps<DataT> &
  LayerProps<DataT>;
export default class SolidPolygonLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_SolidPolygonLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<SolidPolygonLayerProps<any>>;
  static layerName: string;
  state: {
    topModel?: Model;
    sideModel?: Model;
    models?: Model[];
    numInstances: number;
    polygonTesselator: PolygonTesselator;
  };
  getShaders(type: any): any;
  get wrapLongitude(): boolean;
  initializeState(): void;
  getPickingInfo(params: GetPickingInfoParams): PickingInfo;
  disablePickingIndex(objectIndex: number): void;
  draw({uniforms}: {uniforms: any}): void;
  updateState(updateParams: UpdateParameters<this>): void;
  protected updateGeometry({props, oldProps, changeFlags}: UpdateParameters<this>): void;
  protected _getModels(): {
    models: Model[];
    topModel: any;
    sideModel: any;
  };
  protected calculateIndices(attribute: any): void;
  protected calculatePositions(attribute: any): void;
  protected calculateVertexValid(attribute: any): void;
}
export {};
// # sourceMappingURL=solid-polygon-layer.d.ts.map
