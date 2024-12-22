import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import QuadbinLayer, {QuadbinLayerProps} from './quadbin-layer';
export declare const renderSubLayers: (props: any) => QuadbinLayer<
  any,
  {
    getQuadbin: (d: any) => any;
  }
>;
/** All properties supported by QuadbinTileLayer. */
export declare type QuadbinTileLayerProps<DataT = any> = _QuadbinTileLayerProps<DataT> &
  CompositeLayerProps<DataT>;
/** Properties added by QuadbinTileLayer. */
declare type _QuadbinTileLayerProps<DataT> = QuadbinLayerProps<DataT> & {
  aggregationResLevel?: number;
};
export default class QuadbinTileLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  ExtraProps & Required<_QuadbinTileLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<QuadbinTileLayerProps<any>>;
  state: {
    tileJSON: any;
    data: any;
  };
  initializeState(): void;
  updateState({changeFlags}: UpdateParameters<this>): void;
  renderLayers(): Layer | null | LayersList;
}
export {};
// # sourceMappingURL=quadbin-tile-layer.d.ts.map
