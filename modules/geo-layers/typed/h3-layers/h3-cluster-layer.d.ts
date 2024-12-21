import {H3IndexInput} from 'h3-js';
import {AccessorFunction, UpdateParameters, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
/** All properties supported by H3ClusterLayer. */
export declare type H3ClusterLayerProps<DataT = any> = _H3ClusterLayerProps<DataT> &
  GeoCellLayerProps<DataT>;
/** Properties added by H3ClusterLayer. */
declare type _H3ClusterLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the hexagon identifiers.
   *
   * By default, it reads `hexagons` property of data object.
   */
  getHexagons?: AccessorFunction<DataT, H3IndexInput[]>;
};
export default class H3ClusterLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<_H3ClusterLayerProps<DataT>> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<H3ClusterLayerProps<any>>;
  initializeState(): void;
  updateState({props, changeFlags}: UpdateParameters<this>): void;
  indexToBounds(): Partial<GeoCellLayer['props']>;
}
export {};
// # sourceMappingURL=h3-cluster-layer.d.ts.map
