import {GeoJsonLayer, CompositeLayer} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: props => new GeoJsonLayer(props),
  getTileData: ({x, y, z}) => Promise.resolve(null),
  maxZoom: null,
  minZoom: null,
  maxCacheSize: null
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    const {maxZoom, minZoom, getTileData} = this.props;
    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData, maxZoom, minZoom}),
      isLoaded: false
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
      const {getTileData, maxZoom, minZoom, maxCacheSize} = props;
      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({getTileData, maxSize: maxCacheSize, maxZoom, minZoom})
      });
    }
    if (changeFlags.viewportChanged) {
      const {viewport} = context;
      const z = this.getLayerZoomLevel();
      if (viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
        this.state.tileCache.update(viewport, tiles => {
          const currTiles = tiles.filter(tile => tile.z === z);
          const allCurrTilesLoaded = currTiles.every(tile => tile.isLoaded);
          this.setState({tiles, isLoaded: allCurrTilesLoaded});
          if (!allCurrTilesLoaded) {
            Promise.all(currTiles.map(tile => tile.data)).then(() =>
              this.setState({isLoaded: true})
            );
          }
        });
      }
    }
  }

  getPickingInfo({info}) {
    return info;
  }

  getLayerZoomLevel() {
    const z = Math.floor(this.context.viewport.zoom);
    const {maxZoom, minZoom} = this.props;
    if (maxZoom && parseInt(maxZoom, 10) === maxZoom && z > maxZoom) {
      return maxZoom;
    } else if (minZoom && parseInt(minZoom, 10) === minZoom && z < minZoom) {
      return minZoom;
    }
    return z;
  }

  renderLayers() {
    // eslint-disable-next-line no-unused-vars
    const {getTileData, renderSubLayers, ...geoProps} = this.props;
    const z = this.getLayerZoomLevel();
    return this.state.tiles.map(tile => {
      return renderSubLayers({
        ...geoProps,
        id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
        data: tile.data,
        visible: !this.state.isLoaded || tile.z === z
      });
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
