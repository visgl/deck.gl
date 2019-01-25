import {GeoJsonLayer, CompositeLayer} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: props => new GeoJsonLayer(props),
  getTileData: ({x, y, z}) => Promise.resolve(null),
  onDataLoaded: () => {},
  // eslint-disable-next-line
  onGetTileDataError: err => console.error(err),
  maxZoom: null,
  minZoom: null,
  maxCacheSize: null
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    const {maxZoom, minZoom, getTileData, onGetTileDataError} = this.props;
    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData, maxZoom, minZoom, onGetTileDataError}),
      isLoaded: false
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    const {onDataLoaded, onGetTileDataError} = props;
    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData)
    ) {
      const {getTileData, maxZoom, minZoom, maxCacheSize} = props;
      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({
          getTileData,
          maxSize: maxCacheSize,
          maxZoom,
          minZoom,
          onGetTileDataError
        })
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
            Promise.all(currTiles.map(tile => tile.data)).then(() => {
              this.setState({isLoaded: true});
              onDataLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
            });
          } else {
            onDataLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
          }
        });
      }
    }
  }

  getPickingInfo({info, sourceLayer}) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
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
    const {getTileData, renderSubLayers, visible, ...geoProps} = this.props;
    const z = this.getLayerZoomLevel();
    return this.state.tiles.map(tile => {
      return renderSubLayers({
        ...geoProps,
        id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
        data: tile.data,
        visible: visible && (!this.state.isLoaded || tile.z === z),
        tile
      });
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
