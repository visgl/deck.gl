import {DefaultProps, UpdateParameters} from '@deck.gl/core';
import {PickingInfo} from '@deck.gl/core';
import {
  TileLayer,
  _Tile2DHeader as Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
/** All properties supported by SpatialIndexTileLayer. */
export declare type SpatialIndexTileLayerProps<DataT = any> = _SpatialIndexTileLayerProps<DataT> &
  TileLayer<DataT>;
/** Properties added by SpatialIndexTileLayer. */
declare type _SpatialIndexTileLayerProps<DataT = any> = {
  aggregationResLevel?: number;
};
export default class SpatialIndexTileLayer<DataT = any, ExtraProps = {}> extends TileLayer<
  DataT,
  ExtraProps & Required<_SpatialIndexTileLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<SpatialIndexTileLayerProps<any>>;
  getTileData(tile: TileLoadProps): any;
  updateState(params: UpdateParameters<this>): void;
  protected _updateAutoHighlight(info: PickingInfo): void;
  getSubLayerPropsByTile(tile: Tile2DHeader): {
    highlightedObjectIndex: number;
    highlightColor: any;
  };
  getHighlightedObjectIndex(tile: Tile2DHeader): number;
}
export {};
// # sourceMappingURL=spatial-index-tile-layer.d.ts.map
