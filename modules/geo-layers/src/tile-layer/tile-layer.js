import {CompositeLayer} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: {type: 'function', value: props => new GeoJsonLayer(props)},
  getTileData: {type: 'function', value: ({x, y, z}) => Promise.resolve(null)},
  onViewportLoaded: {type: 'function', value: () => {}},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err)},
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    const {maxZoom, minZoom, getTileData, onTileError} = this.props;
    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData, maxZoom, minZoom, onTileError}),
      isLoaded: false
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    const {onViewportLoaded, onTileError} = props;
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
          onTileError
        })
      });
    }
    const {viewport} = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      const {tileCache} = this.state;
      const z = this.getLayerZoomLevel();
      tileCache.update(viewport);
      // The tiles should be displayed at this zoom level
      const currTiles = tileCache.tiles.filter(tile => tile.z === z);
      const allCurrTilesLoaded = currTiles.every(tile => tile.isLoaded);
      this.setState({isLoaded: allCurrTilesLoaded});

      if (!allCurrTilesLoaded) {
        Promise.all(currTiles.map(tile => tile.data)).then(() => {
          this.setState({isLoaded: true});
          onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
        });
      } else {
        onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
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
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    return this.state.tileCache.tiles.map(tile => {
      const isVisible = visible && tile.isVisible && (!this.state.isLoaded || tile.z === z);
      if (tile.layer && tile.layer.props.visible !== isVisible) {
        tile.layer = tile.layer.clone({visible: isVisible});
      }
      if (!tile.layer) {
        tile.layer = renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
            data: tile.data,
            visible: isVisible,
            tile
          })
        );
      }
      return tile.layer;
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
