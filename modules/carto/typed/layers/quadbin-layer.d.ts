import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import {
  _GeoCellLayer as GeoCellLayer,
  _GeoCellLayerProps as GeoCellLayerProps
} from '@deck.gl/geo-layers';
/** All properties supported by QuadbinLayer. */
export declare type QuadbinLayerProps<DataT = any> = _QuadbinLayerProps<DataT> &
  GeoCellLayerProps<DataT>;
/** Properties added by QuadbinLayer. */
declare type _QuadbinLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the quadbin string identifier.
   *
   * By default, it reads `quadbin` property of data object.
   */
  getQuadbin?: AccessorFunction<DataT, bigint>;
};
export default class QuadbinLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<_QuadbinLayerProps<DataT>> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<QuadbinLayerProps<any>>;
  indexToBounds(): Partial<GeoCellLayer['props']> | null;
}
export {};
// # sourceMappingURL=quadbin-layer.d.ts.map
