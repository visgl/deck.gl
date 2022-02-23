/* global TextDecoder */
import Protobuf from 'pbf';
import {log} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer, _getURLFromTemplate} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';
import {Tile} from './schema/carto-tile';
import {TILE_FORMATS} from '../api/maps-api-common';

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parsePbf(buffer) {
  const pbf = new Protobuf(buffer);
  const tile = Tile.read(pbf);
  return tile;
}

function unpackProperties(properties) {
  if (!properties || !properties.length) {
    return [];
  }
  return properties.map(item => {
    const currentRecord = {};
    item.data.forEach(({key, value}) => {
      currentRecord[key] = value;
    });
    return currentRecord;
  });
}

function parseCartoTile(arrayBuffer, options) {
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

  return data;
}

const CartoTileLoader = {
  name: 'CARTO Tile',
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
      // TODO change to BINARY for 8.7 prod release
      formatTiles: TILE_FORMATS.BINARY
    }
  }
};

export default class CartoTileLayer extends MVTLayer {
  static layerName = 'CartoTileLayer';
  static defaultProps = {...MVTLayer.defaultProps, loaders: [CartoTileLoader]};

  getTileData(tile) {
    let url = _getURLFromTemplate(this.state.data, tile);
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
      // eslint-disable-next-line no-undef
      const newUrl = new URL(url);
      newUrl.searchParams.set('formatTiles', formatTiles);
      url = newUrl.toString();
      loadOptions.cartoTile = {formatTiles};
    }

    return fetch(url, {propName: 'data', layer: this, loadOptions, signal});
  }

  renderSubLayers(props) {
    if (props.data === null) {
      return null;
    }

    props.autoHighlight = false;

    const {
      bbox: {west, south, east, north}
    } = props.tile;
    props.extensions = [new ClipExtension(), ...(props.extensions || [])];
    props.clipBounds = [west, south, east, north];

    const subLayer = new GeoJsonLayer({
      ...props
    });
    return subLayer;
  }
}
