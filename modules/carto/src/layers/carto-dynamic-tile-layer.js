/* global TextDecoder */
import Protobuf from 'pbf';
import {log} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer, _getURLFromTemplate} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {binaryToGeojson, geojsonToBinary} from '@loaders.gl/gis';
import {Tile} from './schema/carto-dynamic-tile';
import {encodeParameter, TILE_FORMATS} from '../api/maps-api-common';

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parsePbf(buffer) {
  const pbf = new Protobuf(buffer);
  const tile = Tile.read(pbf);
  return tile;
}

function convertToTypedArray(obj, TypedArray) {
  obj.value = new TypedArray(Object.values(obj.value));
}

function tileToBinary({points, lines, polygons}) {
  convertToTypedArray(points.positions, Float32Array);
  convertToTypedArray(points.globalFeatureIds, Uint32Array);
  convertToTypedArray(points.featureIds, Uint32Array);

  convertToTypedArray(lines.positions, Float32Array);
  convertToTypedArray(lines.pathIndices, Uint32Array);
  convertToTypedArray(lines.globalFeatureIds, Uint32Array);
  convertToTypedArray(lines.featureIds, Uint32Array);

  convertToTypedArray(polygons.positions, Float32Array);
  convertToTypedArray(polygons.polygonIndices, Uint32Array);
  convertToTypedArray(polygons.primitivePolygonIndices, Uint32Array);
  convertToTypedArray(polygons.globalFeatureIds, Uint32Array);
  convertToTypedArray(polygons.featureIds, Uint32Array);
  convertToTypedArray(polygons.triangles, Uint32Array);

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

function parseCartoDynamicTile(arrayBuffer, options) {
  if (!arrayBuffer) return null;
  const formatTiles = options && options.cartoDynamicTile && options.cartoDynamicTile.formatTiles;
  if (formatTiles === TILE_FORMATS.GEOJSON) return geojsonToBinary(parseJSON(arrayBuffer).features);

  const tile = formatTiles === TILE_FORMATS.WIP ? parseJSON(arrayBuffer) : parsePbf(arrayBuffer);
  const binary = tileToBinary(tile);

  const {points, lines, polygons} = binary;
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
      formatTiles: TILE_FORMATS.BINARY
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
        Object.values(TILE_FORMATS).includes(formatTiles),
        `Invalid value for formatTiles: ${formatTiles}. Use value from TILE_FORMATS`
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
