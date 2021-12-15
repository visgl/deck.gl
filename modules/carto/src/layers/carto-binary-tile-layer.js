/* global TextDecoder */
import {log} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';

function parseJSON(arrayBuffer) {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}

function parseCartoBinaryTile(arrayBuffer, options) {
  if (!arrayBuffer) return null;
  const formatTiles = (options && options.formatTiles) || 'geojson';
  if (formatTiles === 'geojson') return geojsonToBinary(parseJSON(arrayBuffer).features);
  log.assert(formatTiles === 'geojson', `formatTiles must be geojson`);
  return null;
}

const CartoBinaryTileLoader = {
  name: 'CARTO Binary Tile',
  id: 'cartoBinaryTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoBinaryTile(arrayBuffer, options),
  parseSync: parseCartoBinaryTile
};

// Currently we only support loading via geojson, but in future the data
// format will be binary, as such keep `binary` in layer name
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
