import {CompositeLayer, CompositeLayerProps, Layer, LayersList, DefaultProps} from '@deck.gl/core';
import {PolygonLayerProps} from '@deck.gl/layers';
/** All properties supported by GeoCellLayer. */
export declare type GeoCellLayerProps<DataT = any> = PolygonLayerProps<DataT> &
  CompositeLayerProps<DataT>;
export default class GeoCellLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  Required<GeoCellLayerProps<DataT>> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<GeoCellLayerProps<any>>;
  /** Implement to generate props to create geometry. */
  indexToBounds(): Partial<GeoCellLayer['props']> | null;
  renderLayers(): Layer | null | LayersList;
}
// # sourceMappingURL=GeoCellLayer.d.ts.map
