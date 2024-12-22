import {
  Layer,
  LayersList,
  PickingInfo,
  UpdateParameters,
  GetPickingInfoParams,
  DefaultProps
} from '@deck.gl/core';
import {GeoJsonLayerProps} from '@deck.gl/layers';
import type {Loader} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';
import type {Feature} from 'geojson';
import TileLayer, {TiledPickingInfo, TileLayerProps} from '../tile-layer/tile-layer';
import {Tileset2DProps} from '../tile-layer/tileset-2d';
import {TileLoadProps} from '../tile-layer/types';
import Tile2DHeader from '../tile-layer/tile-2d-header';
export declare type TileJson = {
  tilejson: string;
  tiles: string[];
  vector_layers: any[];
  attribution?: string;
  scheme?: string;
  maxzoom?: number;
  minzoom?: number;
  version?: string;
};
declare type ParsedMvtTile = Feature[] | BinaryFeatures;
/** All props supported by the MVTLayer */
export declare type MVTLayerProps<DataT extends Feature = Feature> = _MVTLayerProps &
  GeoJsonLayerProps<DataT> &
  TileLayerProps<ParsedMvtTile>;
/** Props added by the MVTLayer  */
export declare type _MVTLayerProps = {
  /** Called if `data` is a TileJSON URL when it is successfully fetched. */
  onDataLoad?: ((tilejson: TileJson | null) => void) | null;
  /** Needed for highlighting a feature split across two or more tiles. */
  uniqueIdProperty?: string;
  /** A feature with ID corresponding to the supplied value will be highlighted. */
  highlightedFeatureId?: string | null;
  /**
   * Use tile data in binary format.
   *
   * @default true
   */
  binary?: boolean;
  /**
   * Loaders used to transform tiles into `data` property passed to `renderSubLayers`.
   *
   * @default [MVTWorkerLoader] from `@loaders.gl/mvt`
   */
  loaders?: Loader[];
};
/** Render data formatted as [Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/). */
export default class MVTLayer<DataT extends Feature = Feature, ExtraProps = {}> extends TileLayer<
  ParsedMvtTile,
  Required<_MVTLayerProps> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<
    MVTLayerProps<
      Feature<
        import('geojson').Geometry,
        {
          [name: string]: any;
        }
      >
    >
  >;
  initializeState(): void;
  get isLoaded(): boolean;
  updateState({props, oldProps, context, changeFlags}: UpdateParameters<this>): void;
  private _updateTileData;
  _getTilesetOptions(): Tileset2DProps;
  renderLayers(): Layer | null | LayersList;
  getTileData(loadProps: TileLoadProps): Promise<ParsedMvtTile>;
  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: ParsedMvtTile;
      _offset: number;
      tile: Tile2DHeader<ParsedMvtTile>;
    }
  ): Layer | null | LayersList;
  protected _updateAutoHighlight(info: PickingInfo): void;
  getPickingInfo(params: GetPickingInfoParams): TiledPickingInfo;
  getSubLayerPropsByTile(tile: Tile2DHeader<ParsedMvtTile>): Record<string, any>;
  private getHighlightedObjectIndex;
  private _pickObjects;
  /** Get the rendered features in the current viewport. */
  getRenderedFeatures(maxFeatures?: number | null): DataT[];
  private _setWGS84PropertyForTiles;
}
export {};
// # sourceMappingURL=mvt-layer.d.ts.map
