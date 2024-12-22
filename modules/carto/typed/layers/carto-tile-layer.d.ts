import {DefaultProps} from '@deck.gl/core';
import {
  MVTLayer,
  MVTLayerProps,
  TileLayer,
  _Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {TileFormat} from '../api/maps-api-common';
import type {Feature} from 'geojson';
/** All properties supported by CartoTileLayer. */
export declare type CartoTileLayerProps<DataT extends Feature = Feature> = _CartoTileLayerProps &
  MVTLayerProps<DataT>;
/** Properties added by CartoTileLayer. */
declare type _CartoTileLayerProps = {
  /** Use to override the default tile data format.
   *
   * Possible values are: `TILE_FORMATS.BINARY`, `TILE_FORMATS.GEOJSON` and `TILE_FORMATS.MVT`.
   *
   * Only supported when `apiVersion` is `API_VERSIONS.V3` and `format` is `FORMATS.TILEJSON`.
   */
  formatTiles?: TileFormat;
};
export default class CartoTileLayer<
  DataT extends Feature = Feature,
  ExtraProps = {}
> extends MVTLayer<DataT, Required<_CartoTileLayerProps> & ExtraProps> {
  static layerName: string;
  static defaultProps: DefaultProps<
    CartoTileLayerProps<
      Feature<
        import('geojson').Geometry,
        {
          [name: string]: any;
        }
      >
    >
  >;
  initializeState(): void;
  getTileData(tile: TileLoadProps): any;
  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: any;
      _offset: number;
      tile: _Tile2DHeader;
    }
  ): GeoJsonLayer | null;
  getPickingInfo(
    params: any
  ): import('modules/geo-layers/src/tile-layer/tile-layer').TiledPickingInfo<any>;
}
export {};
// # sourceMappingURL=carto-tile-layer.d.ts.map
