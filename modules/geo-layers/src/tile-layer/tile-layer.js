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
              onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
            });
          } else {
            onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
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
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    return this.aggregateByZoomLevel(this.state.tiles).map(aggregatedTile => {
      return renderSubLayers(
        Object.assign({}, this.props, {
          id: `${this.id}-${aggregatedTile.z}`,
          data: aggregatedTile.data.length
            ? aggregatedTile.data.flat()
            : aggregatedTile.dataPromiseWrapped,
          visible: visible && (!this.state.isLoaded || aggregatedTile.z === z)
        })
      );
    });
  }

  aggregateByZoomLevel(tiles) {
    const aggregation = tiles.reduce((tilesByZoomLevel, currentTile) => {
      const tileExists = tilesByZoomLevel.hasOwnProperty(currentTile.z);

      if (!tileExists) {
        tilesByZoomLevel[currentTile.z] = {
          data: [],
          pendingData: [],
          dataPromiseWrapped: null,
          z: currentTile.z,
          tileSet: new Map()
        };
      }

      if (currentTile._isLoaded) {
        tilesByZoomLevel[currentTile.z].data.push(currentTile.data);
      } else {
        tilesByZoomLevel[currentTile.z].pendingData.push(currentTile.data);
        tilesByZoomLevel[currentTile.z].dataPromiseWrapped = Promise.all(
          tilesByZoomLevel[currentTile.z].pendingData
        ).then(allData => allData.flat());
      }

      tilesByZoomLevel[currentTile.z].tileSet.set(currentTile.id, currentTile);

      return tilesByZoomLevel;
    }, {});

    return Object.values(aggregation);
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
