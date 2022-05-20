import {CompositeLayer} from '@deck.gl/core';
import {QuadkeyLayer} from '@deck.gl/geo-layers';
import QuadkeyTileset2D from './quadkey-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';

const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  return new QuadkeyLayer(props);
};

const defaultProps = {
  aggregationResLevel: 6
};

export default class QuadkeyTileLayer extends CompositeLayer {
  initializeState() {
    this.setState({data: null, tileJSON: null});
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (changeFlags.dataChanged) {
      let {data} = this.props;
      const tileJSON = data;
      data = tileJSON.tiles;
      this.setState({data, tileJSON});
    }
  }

  renderLayers() {
    const {data, tileJSON} = this.state;
    const maxZoom = parseInt(tileJSON.maxresolution);
    return [
      new SpatialIndexTileLayer(this.props, {
        id: 'quadkey-tile-layer',
        data,
        getQuadkey: d => d.id,
        TilesetClass: QuadkeyTileset2D,
        renderSubLayers,
        maxZoom
      })
    ];
  }
}

QuadkeyTileLayer.layerName = 'QuadkeyTileLayer';
QuadkeyTileLayer.defaultProps = defaultProps;
