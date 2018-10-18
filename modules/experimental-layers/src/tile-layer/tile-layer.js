import {GeoJsonLayer, CompositeLayer} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: props => new GeoJsonLayer(props),
  getTileData: ({x, y, z}) => Promise.resolve(null)
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData: this.props.getTileData})
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData)
    ) {
      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({getTileData: this.props.getTileData})
      });
    }
    if (changeFlags.viewportChanged) {
      this.state.tileCache.update(context.viewport, tiles => this.setState({tiles}));
    }
  }

  getPickingInfo({info}) {
    return info;
  }

  renderLayers() {
    // eslint-disable-next-line no-unused-vars
    const {getTileData, renderSubLayers, ...geoProps} = this.props;
    return this.state.tiles.map(tile => {
      return renderSubLayers({
        ...geoProps,
        id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
        data: tile.data
      });
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
