import {GeoJsonLayer, CompositeLayer} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: props => new GeoJsonLayer(props),
  getTileData: ({x, y, z}) => Promise.resolve(null)
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    const {maxZoom, minZoom, getTileData} = this.props;
    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData, maxZoom, minZoom})
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
      const {getTileData, maxZoom, minZoom} = props;
      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({getTileData, maxZoom, minZoom})
      });
    }
    if (changeFlags.viewportChanged) {
      const {viewport} = context;
      if (viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
        this.state.tileCache.update(viewport, tiles => this.setState({tiles}));
      }
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
