import {CompositeLayer} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: {type: 'function', value: props => new GeoJsonLayer(props)},
  getTileData: {type: 'function', value: ({x, y, z}) => Promise.resolve(null)},
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoaded: {type: 'function', optional: true, value: null},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err)},
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tiles: [],
      isLoaded: false
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    let {tileCache} = this.state;
    if (!tileCache || changeFlags.updateTriggersChanged) {
      const {getTileData, maxZoom, minZoom, maxCacheSize} = props;
      if (tileCache) {
        tileCache.finalize();
      }
      tileCache = new TileCache({
        getTileData,
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        onTileLoad: this._onTileLoad.bind(this),
        onTileError: this._onTileError.bind(this)
      });
      this.setState({tileCache});
    }
    const {viewport} = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      const z = this.getLayerZoomLevel();
      tileCache.update(viewport);
      // The tiles that should be displayed at this zoom level
      const currTiles = tileCache.tiles.filter(tile => tile.z === z);
      this.setState({isLoaded: false, tiles: currTiles});
      this._onTileLoad();
    }
  }

  _onTileLoad() {
    const {onViewportLoaded} = this.props;
    const currTiles = this.state.tiles;
    const allCurrTilesLoaded = currTiles.every(tile => tile.isLoaded);
    if (this.state.isLoaded !== allCurrTilesLoaded) {
      this.setState({isLoaded: allCurrTilesLoaded});
      if (allCurrTilesLoaded && onViewportLoaded) {
        onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
      }
    }
  }

  _onTileError(error) {
    this.props.onTileError(error);
    // errorred tiles should not block rendering, are considered "loaded" with empty data
    this._onTileLoad();
  }

  getPickingInfo({info, sourceLayer}) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
    return info;
  }

  getLayerZoomLevel() {
    const z = Math.floor(this.context.viewport.zoom);
    const {maxZoom, minZoom} = this.props;
    if (Number.isFinite(maxZoom) && z > maxZoom) {
      return Math.floor(maxZoom);
    } else if (Number.isFinite(minZoom) && z < minZoom) {
      return Math.ceil(minZoom);
    }
    return z;
  }

  renderLayers() {
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    return this.state.tileCache.tiles.map(tile => {
      // For a tile to be visible:
      // - parent layer must be visible
      // - tile must be visible in the current viewport
      // - if all tiles are loaded, only display the tiles from the current z level
      const isVisible = visible && tile.isVisible && (!this.state.isLoaded || tile.z === z);
      // cache the rendered layer in the tile
      if (!tile.layer) {
        tile.layer = renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
            data: tile.data,
            visible: isVisible,
            tile
          })
        );
      } else if (tile.layer.props.visible !== isVisible) {
        tile.layer = tile.layer.clone({visible: isVisible});
      }
      return tile.layer;
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
