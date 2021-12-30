/* global TextDecoder */
import {log} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer, _getURLFromTemplate} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';
import {encodeParameter} from '../api/maps-api-common';

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parseCartoDynamicTile(arrayBuffer, options) {
  if (!arrayBuffer) return null;
  const formatTiles = options && options.cartoDynamicTile && options.cartoDynamicTile.formatTiles;
  if (formatTiles === 'geojson') return geojsonToBinary(parseJSON(arrayBuffer).features);
  return null;
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
        ['geojson'].includes(formatTiles),
        `Invalid value for formatTiles: ${formatTiles}`
      );
      url += `&${encodeParameter('formatTiles', formatTiles)}`;
      loadOptions.cartoBinaryTile = {formatTiles};
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
