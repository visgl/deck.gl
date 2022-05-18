import {CompositeLayer} from '@deck.gl/core';
import {QuadkeyLayer, TileLayer} from '@deck.gl/geo-layers';
import QuadkeyTileset2D from './quadkey-tileset-2d';

const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  return new QuadkeyLayer(props);
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
    const {maxresolution} = tileJSON;
    const maxZoom = maxresolution - this.props.aggregationResLevel;
    return [
      new TileLayer(this.props, {
        id: 'quadkey-tile-layer',
        data,
        TilesetClass: QuadkeyTileset2D,
        renderSubLayers,
        maxZoom
      })
    ];
  }
}

QuadkeyTileLayer.layerName = 'QuadkeyTileLayer';
