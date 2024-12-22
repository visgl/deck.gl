import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
/** All properties supported by H3TileLayer. */
export declare type H3TileLayerProps<DataT = any> = _H3TileLayerProps<DataT> &
  CompositeLayerProps<DataT>;
declare type H3HexagonLayerProps<DataT = any> = Record<string, any>;
/** Properties added by H3TileLayer. */
declare type _H3TileLayerProps<DataT> = H3HexagonLayerProps<DataT> & {
  aggregationResLevel?: number;
};
export default class H3TileLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_H3TileLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<H3HexagonLayerProps<any>>;
  state: {
    tileJSON: any;
    data: any;
  };
  initializeState(): void;
  updateState({changeFlags}: UpdateParameters<this>): void;
  renderLayers(): Layer | null | LayersList;
}
export {};
// # sourceMappingURL=h3-tile-layer.d.ts.map
