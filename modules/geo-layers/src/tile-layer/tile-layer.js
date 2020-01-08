import {CompositeLayer} from '@deck.gl/core';
import {BaseTileLayer} from '@deck.gl/layers';
import {tile2geoBoundingBox} from './utils/tile-util';
import {getGeoTileIndices} from './utils/viewport-util';

export default class TileLayer extends CompositeLayer {
  renderLayers() {
    const tileSize = 256;
    const tile2boundingBox = tile2geoBoundingBox;
    const getTileIndices = getGeoTileIndices;
    const SubLayerClass = this.getSubLayerClass('base-tile-layer', BaseTileLayer);
    return [
      new SubLayerClass({
        tileSize,
        tile2boundingBox,
        getTileIndices,
        ...this.props
      })
    ];
  }
}

TileLayer.layerName = 'TileLayer';
