import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayerProps,
  UpdateParameters,
  PickingInfo,
  GetPickingInfoParams,
  FilterContext
} from '@deck.gl/core';
import {LayersList} from '@deck.gl/core';
import Tile2DHeader from './tile-2d-header';
import Tileset2D, {RefinementStrategy, Tileset2DProps} from './tileset-2d';
import {TileLoadProps, ZRange} from './types';
/** All props supported by the TileLayer */
export declare type TileLayerProps<DataT = any> = CompositeLayerProps<any> & _TileLayerProps<DataT>;
/** Props added by the TileLayer */
declare type _TileLayerProps<DataT> = {
  /**
   * Optionally implement a custom indexing scheme.
   */
  TilesetClass: typeof Tileset2D;
  /**
   * Renders one or an array of Layer instances.
   */
  renderSubLayers?: (
    props: TileLayerProps<DataT> & {
      id: string;
      data: DataT;
      _offset: number;
      tile: Tile2DHeader<DataT>;
    }
  ) => Layer | null | LayersList;
  /**
   * If supplied, `getTileData` is called to retrieve the data of each tile.
   */
  getTileData?: ((props: TileLoadProps) => Promise<DataT> | DataT) | null;
  /** Called when all tiles in the current viewport are loaded. */
  onViewportLoad?: ((tiles: Tile2DHeader<DataT>[]) => void) | null;
  /** Called when a tile successfully loads. */
  onTileLoad?: (tile: Tile2DHeader<DataT>) => void;
  /** Called when a tile is cleared from cache. */
  onTileUnload?: (tile: Tile2DHeader<DataT>) => void;
  /** Called when a tile failed to load. */
  onTileError?: (err: any) => void;
  /** The bounding box of the layer's data. */
  extent?: number[] | null;
  /** The pixel dimension of the tiles, usually a power of 2. */
  tileSize?: number;
  /** The max zoom level of the layer's data.
   * @default null
   */
  maxZoom?: number | null;
  /** The min zoom level of the layer's data.
   * @default 0
   */
  minZoom?: number | null;
  /** The maximum number of tiles that can be cached. */
  maxCacheSize?: number | null;
  /**
   * The maximum memory used for caching tiles.
   *
   * @default null
   */
  maxCacheByteSize?: number | null;
  /**
   * How the tile layer refines the visibility of tiles.
   *
   * @default 'best-available'
   */
  refinementStrategy?: RefinementStrategy;
  /** Range of minimum and maximum heights in the tile. */
  zRange?: ZRange | null;
  /**
   * The maximum number of concurrent getTileData calls.
   *
   * @default 6
   */
  maxRequests?: number;
  /**
   * This offset changes the zoom level at which the tiles are fetched.
   *
   * Needs to be an integer.
   *
   * @default 0
   */
  zoomOffset?: number;
};
export declare type TiledPickingInfo<DataT = any> = PickingInfo & {
  tile?: Tile2DHeader<DataT>;
};
/**
 * The TileLayer is a composite layer that makes it possible to visualize very large datasets.
 *
 * Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.
 */
export default class TileLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TileLayerProps<DataT>>
> {
  static defaultProps: any;
  static layerName: string;
  initializeState(): void;
  finalizeState(): void;
  get isLoaded(): boolean;
  shouldUpdateState({changeFlags}: {changeFlags: any}): boolean;
  updateState({changeFlags}: UpdateParameters<this>): void;
  _getTilesetOptions(): Tileset2DProps;
  private _updateTileset;
  _onViewportLoad(): void;
  _onTileLoad(tile: Tile2DHeader<DataT>): void;
  _onTileError(error: any, tile: Tile2DHeader<DataT>): void;
  _onTileUnload(tile: Tile2DHeader<DataT>): void;
  getTileData(tile: TileLoadProps): Promise<DataT> | DataT | null;
  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: DataT;
      _offset: number;
      tile: Tile2DHeader<DataT>;
    }
  ): Layer | null | LayersList;
  getSubLayerPropsByTile(tile: Tile2DHeader): Partial<LayerProps> | null;
  getPickingInfo({info, sourceLayer}: GetPickingInfoParams): TiledPickingInfo<DataT>;
  protected _updateAutoHighlight(info: PickingInfo): void;
  renderLayers(): Layer | null | LayersList;
  filterSubLayer({layer, cullRect}: FilterContext): any;
}
export {};
// # sourceMappingURL=tile-layer.d.ts.map
