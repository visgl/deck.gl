/* global devicePixelRatio, document, fetch, performance */
/* eslint-disable no-console */
import {Tile} from './carto-tile';
import Protobuf from 'pbf';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';

const wip = true;

function parsePbf(buffer) {
  const pbf = new Protobuf(buffer);
  const tile = Tile.read(pbf);
  return tile;
}

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function tileToBinary(tile) {
  // Convert to typed arrays
  tile.points.positions.value = new Float32Array(tile.points.positions.value);

  tile.lines.positions.value = new Float32Array(tile.lines.positions.value);
  tile.lines.pathIndices.value = new Uint16Array(tile.lines.pathIndices.value);
  tile.lines.globalFeatureIds = tile.lines.featureIds; // HACK to fix missing data from API

  tile.polygons.positions.value = new Float32Array(tile.polygons.positions.value);
  tile.polygons.polygonIndices.value = new Uint16Array(tile.polygons.polygonIndices.value);
  tile.polygons.primitivePolygonIndices.value = new Uint16Array(
    tile.polygons.primitivePolygonIndices.value
  );
  tile.polygons.globalFeatureIds = tile.polygons.featureIds; // HACK to fix missing data from API

  return {
    points: {type: 'Point', numericProps: {}, properties: [], ...tile.points},
    lines: {type: 'LineString', numericProps: {}, properties: [], ...tile.lines},
    polygons: {type: 'Polygon', numericProps: {}, properties: [], ...tile.polygons}
  };
}

function parseCartoBinaryTile(arrayBuffer, options) {
  if (!arrayBuffer) return null;
  const tile = wip ? parseJSON(arrayBuffer) : parsePbf(arrayBuffer);
  const binary = tileToBinary(tile);
  return binary;
}

const CartoBinaryTileLoader = {
  name: 'CARTO Binary Tile',
  id: 'cartoBinaryTile',
  module: 'carto',
  version: 'dev',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoBinaryTile(arrayBuffer, options),
  parseSync: parseCartoBinaryTile
};

export default class CartoBinaryTileLayer extends MVTLayer {
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

CartoBinaryTileLayer.layerName = 'CartoBinaryTileLayer';
CartoBinaryTileLayer.defaultProps = {...MVTLayer.defaultProps, loaders: [CartoBinaryTileLoader]};
