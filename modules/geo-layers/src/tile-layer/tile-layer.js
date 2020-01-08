import {CompositeLayer} from '@deck.gl/core';
import {BaseTileLayer} from '@deck.gl/layers';
import {tile2boundingBox} from './utils/tile-util';
import {getTileIndices} from './utils/viewport-util';

export default class TileLayer extends CompositeLayer {
  renderLayers() {
    const tileSize = 256;
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
