/* global TextDecoder */
import Protobuf from 'pbf';
import {log} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer, _getURLFromTemplate} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';
import {Tile} from './schema/carto-dynamic-tile-no-props';
import {encodeParameter, FORMAT_TILES} from '../api/maps-api-common';

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parsePbf(buffer) {
  const pbf = new Protobuf(buffer);
  const tile = Tile.read(pbf);
  return tile;
}

function tileToBinary({points, lines, polygons}) {
  // Convert to typed arrays
  points.positions.value = new Float32Array(points.positions.value);

  lines.positions.value = new Float32Array(lines.positions.value);
  lines.pathIndices.value = new Uint16Array(lines.pathIndices.value);

  polygons.positions.value = new Float32Array(polygons.positions.value);
  polygons.polygonIndices.value = new Uint16Array(polygons.polygonIndices.value);
  polygons.primitivePolygonIndices.value = new Uint16Array(polygons.primitivePolygonIndices.value);

  return {points, lines, polygons};
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

function patchMissing({points, lines, polygons}) {
  lines.globalFeatureIds = lines.featureIds; // HACK to fix missing data from API
  polygons.globalFeatureIds = polygons.featureIds; // HACK to fix missing data from API
  return {
    // HACK add in missing numericProps&properties
    points: {type: 'Point', numericProps: {}, properties: [], ...points},
    lines: {type: 'LineString', numericProps: {}, properties: [], ...lines},
    polygons: {type: 'Polygon', numericProps: {}, properties: [], ...polygons}
  };
}

function parseCartoDynamicTile(arrayBuffer, options) {
  if (!arrayBuffer) return null;
  const formatTiles = options && options.cartoDynamicTile && options.cartoDynamicTile.formatTiles;
  if (formatTiles === 'geojson') return geojsonToBinary(parseJSON(arrayBuffer).features);

  const tile = formatTiles === 'wip' ? parseJSON(arrayBuffer) : parsePbf(arrayBuffer);
  let binary = tileToBinary(tile);

  // Temporary fix, which schema is missing values
  let {points, lines, polygons} = patchMissing(binary);

  const data = {
    points: {...points, properties: unpackProperties(points.properties)},
    lines: {...lines, properties: unpackProperties(lines.properties)},
    polygons: {...polygons, properties: unpackProperties(polygons.properties)}
  };

  return data;
}

const CartoDynamicTileLoader = {
  name: 'CARTO Dynamic Tile',
  id: 'cartoDynamicTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoDynamicTile(arrayBuffer, options),
  parseSync: parseCartoDynamicTile,
  options: {
    cartoDynamicTile: {
      formatTiles: 'geojson'
    }
  }
};

export default class CartoDynamicTileLayer extends MVTLayer {
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
        Object.values(FORMAT_TILES).includes(formatTiles),
        `Invalid value for formatTiles: ${formatTiles}. Use value from FORMAT_TILES`
      );
      url += `&${encodeParameter('formatTiles', formatTiles)}`;
      loadOptions.cartoDynamicTile = {formatTiles};
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
    props.extensions = [new ClipExtension()];
    props.clipBounds = [west, south, east, north];

    const subLayer = new GeoJsonLayer({
      ...props
    });
    return subLayer;
  }
}

CartoDynamicTileLayer.layerName = 'CartoDynamicTileLayer';
CartoDynamicTileLayer.defaultProps = {...MVTLayer.defaultProps, loaders: [CartoDynamicTileLoader]};
