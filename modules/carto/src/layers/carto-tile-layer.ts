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
import {geojsonToBinary} from '@loaders.gl/gis';
import {Properties, Tile, TileReader} from './schema/carto-tile';
import {TileFormat, TILE_FORMATS} from '../api/maps-api-common';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';
import type {Feature} from 'geojson';

function parseJSON(arrayBuffer: ArrayBuffer): any {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parsePbf(buffer: ArrayBuffer): Tile {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

function unpackProperties(properties: Properties[]) {
  if (!properties || !properties.length) {
    return [];
  }
  return properties.map(item => {
    const currentRecord: Record<string, unknown> = {};
    item.data.forEach(({key, value}) => {
      currentRecord[key] = value;
    });
    return currentRecord;
  });
}

function parseCartoTile(arrayBuffer: ArrayBuffer, options?: LoaderOptions): BinaryFeatures | null {
  if (!arrayBuffer) return null;
  const formatTiles = options && options.cartoTile && options.cartoTile.formatTiles;
  if (formatTiles === TILE_FORMATS.GEOJSON) return geojsonToBinary(parseJSON(arrayBuffer).features);

  const tile = parsePbf(arrayBuffer);

  const {points, lines, polygons} = tile;
  const data = {
    points: {...points, properties: unpackProperties(points.properties)},
    lines: {...lines, properties: unpackProperties(lines.properties)},
    polygons: {...polygons, properties: unpackProperties(polygons.properties)}
  };

  // Note: there is slight, difference in `numericProps` type, however geojson/mvtlayer can cope with this
  return data as unknown as BinaryFeatures;
}

const defaultTileFormat = TILE_FORMATS.BINARY;

const CartoTileLoader: LoaderWithParser = {
  name: 'CARTO Tile',
  version: '1',
  id: 'cartoTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoTile(arrayBuffer, options),
  parseSync: parseCartoTile,
  options: {
    cartoTile: {
      formatTiles: defaultTileFormat
    }
  }
};

const defaultProps: DefaultProps<CartoTileLayerProps> = {
  ...MVTLayer.defaultProps,
  formatTiles: defaultTileFormat,
  loaders: [CartoTileLoader]
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
      mimeType: 'application/x-protobuf'
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
