import {CompositeLayer, _flatten as flatten} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

import Tileset2D, {STRATEGY_DEFAULT} from './tileset-2d';
import {urlType, getURLFromTemplate} from './utils';

const defaultProps = {
  data: [],
  dataComparator: urlType.equals,
  renderSubLayers: {type: 'function', value: props => new GeoJsonLayer(props), compare: false},
  getTileData: {type: 'function', optional: true, value: null, compare: false},
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoad: {type: 'function', optional: true, value: null, compare: false},
  onTileLoad: {type: 'function', value: tile => {}, compare: false},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err), compare: false},
  extent: {type: 'array', optional: true, value: null, compare: true},
  tileSize: 512,
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
  zRange: null,
  maxRequests: 8
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tiles: [],
      isLoaded: false
    };
  }

  get isLoaded() {
    const {tileset} = this.state;
    return tileset.selectedTiles.every(
      tile => tile.layers && tile.layers.every(layer => layer.isLoaded)
    );
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    let {tileset} = this.state;
    const createTileCache =
      !tileset ||
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData));

    if (createTileCache) {
      const {
        maxZoom,
        minZoom,
        tileSize,
        maxCacheSize,
        maxCacheByteSize,
        refinementStrategy,
        extent,
        maxRequests
      } = props;
      tileset = new Tileset2D({
        getTileData: this.getTileData.bind(this),
        maxCacheSize,
        maxCacheByteSize,
        maxZoom,
        minZoom,
        tileSize,
        refinementStrategy,
        extent,
        onTileLoad: this._onTileLoad.bind(this),
        onTileError: this._onTileError.bind(this),
        maxRequests
      });
      this.setState({tileset});
    } else if (changeFlags.propsChanged || changeFlags.updateTriggersChanged) {
      tileset.setOptions(props);
      // if any props changed, delete the cached layers
      this.state.tileset.tiles.forEach(tile => {
        tile.layers = null;
      });
    }

    this._updateTileset();
  }

  _updateTileset() {
    const {tileset} = this.state;
    const {onViewportLoad, zRange} = this.props;
    const frameNumber = tileset.update(this.context.viewport, {zRange});
    const {isLoaded} = tileset;

    const loadingStateChanged = this.state.isLoaded !== isLoaded;
    const tilesetChanged = this.state.frameNumber !== frameNumber;

    if (isLoaded && onViewportLoad && (loadingStateChanged || tilesetChanged)) {
      onViewportLoad(tileset.selectedTiles.map(tile => tile.data));
    }

    if (tilesetChanged) {
      // Save the tileset frame number - trigger a rerender
      this.setState({frameNumber});
    }
    // Save the loaded state - should not trigger a rerender
    this.state.isLoaded = isLoaded;
  }

  _onTileLoad(tile) {
    const layer = this.getCurrentLayer();
    layer.props.onTileLoad(tile);

    if (tile.isVisible) {
      this.setNeedsUpdate();
    }
  }

  _onTileError(error, tile) {
    const layer = this.getCurrentLayer();
    layer.props.onTileError(error);
    // errorred tiles should not block rendering, are considered "loaded" with empty data
    layer._updateTileset();

    if (tile.isVisible) {
      this.setNeedsUpdate();
    }
  }

  // Methods for subclass to override

  getTileData(tile) {
    const {getTileData, fetch, data} = this.props;

    tile.url = getURLFromTemplate(data, tile);

    if (getTileData) {
      return getTileData(tile);
    }
    if (tile.url) {
      return fetch(tile.url, {layer: this});
    }
    return null;
  }

  renderSubLayers(props) {
    return this.props.renderSubLayers(props);
  }

  getHighlightedObjectIndex() {
    return -1;
  }

  getPickingInfo({info, sourceLayer}) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
    return info;
  }

  renderLayers() {
    const {visible} = this.props;
    return this.state.tileset.tiles.map(tile => {
      // For a tile to be visible:
      // - parent layer must be visible
      // - tile must be visible in the current viewport
      const isVisible = visible && tile.isVisible;
      const highlightedObjectIndex = this.getHighlightedObjectIndex(tile);
      // cache the rendered layer in the tile
      if (!tile.isLoaded) {
        // no op
      } else if (!tile.layers) {
        const layers = this.renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
            data: tile.data,
            visible: isVisible,
            _offset: 0,
            tile,
            highlightedObjectIndex
          })
        );
        tile.layers = flatten(layers, Boolean);
      } else if (
        tile.layers[0] &&
        (tile.layers[0].props.visible !== isVisible ||
          tile.layers[0].props.highlightedObjectIndex !== highlightedObjectIndex)
      ) {
        tile.layers = tile.layers.map(layer =>
          layer.clone({visible: isVisible, highlightedObjectIndex})
        );
      }
      return tile.layers;
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
