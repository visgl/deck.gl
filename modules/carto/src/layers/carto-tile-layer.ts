/* global TextDecoder */
import Protobuf from 'pbf';
import {log, DefaultProps} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {
  MVTLayer,
  MVTLayerProps,
  TileLayer,
  _getURLFromTemplate,
  _Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {TileFormat, TILE_FORMATS} from '../api/maps-api-common';
import type {Feature} from 'geojson';

import CartoVectorTileLoader from './schema/carto-vector-tile-loader';

// TODO do not define default twice
const defaultTileFormat = TILE_FORMATS.BINARY;

const defaultProps: DefaultProps<CartoTileLayerProps> = {
  ...MVTLayer.defaultProps,
  formatTiles: defaultTileFormat,
  loaders: [CartoVectorTileLoader]
};

/** All properties supported by CartoTileLayer. */
export type CartoTileLayerProps<DataT extends Feature = Feature> = _CartoTileLayerProps &
  MVTLayerProps<DataT>;

/** Properties added by CartoTileLayer. */
type _CartoTileLayerProps = {
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
  static layerName = 'CartoTileLayer';
  static defaultProps = defaultProps;

  getTileData(tile: TileLoadProps) {
    const url = _getURLFromTemplate(this.state.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }

    let loadOptions = this.getLoadOptions();
    const {fetch, formatTiles} = this.props;
    const {signal} = tile;

    loadOptions = {
      ...loadOptions,
      mimeType: 'application/vnd.carto-vector-tile'
    };

    if (formatTiles) {
      log.assert(
        Object.values(TILE_FORMATS).includes(formatTiles),
        `Invalid value for formatTiles: ${formatTiles}. Use value from TILE_FORMATS`
      );
      loadOptions.cartoTile = {formatTiles};
    }

    return fetch(url, {propName: 'data', layer: this, loadOptions, signal});
  }

  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: any;
      _offset: number;
      tile: _Tile2DHeader;
    }
  ): GeoJsonLayer | null {
    if (props.data === null) {
      return null;
    }

    const tileBbox = props.tile.bbox as any;
    const {west, south, east, north} = tileBbox;

    const subLayerProps = {
      ...props,
      autoHighlight: false,
      extensions: [new ClipExtension(), ...(props.extensions || [])],
      clipBounds: [west, south, east, north]
    };

    const subLayer = new GeoJsonLayer(subLayerProps);
    return subLayer;
  }
}
