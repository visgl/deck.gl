import {CompositeLayer} from '@deck.gl/core';
import {H3HexagonLayer, TileLayer} from '@deck.gl/geo-layers';
import H3Tileset2D from './h3-tileset-2d';

const renderSubLayers = props => {
  const {data} = props;
  const {index} = props.tile;
  if (!data || !data.length) return null;

  return new H3HexagonLayer(props, {
    centerHexagon: index,
    highPrecision: true
  });
};

export default class H3TileLayer extends CompositeLayer {
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
    return [
      new TileLayer(this.props, {
        id: 'h3-tile-layer',
        data,
        TilesetClass: H3Tileset2D,
        renderSubLayers
      })
    ];
  }
}

H3TileLayer.layerName = 'H3TileLayer';
