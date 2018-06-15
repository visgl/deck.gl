import {CompositeLayer, GeoJsonLayer} from 'deck.gl';
import {getTileIndices} from './utils/viewport-utils';
import TileCache from './utils/tile-cache';

const defaultProps = {
  opacity: 1,
  source: null,
  layerStyles: []
};

const CACHE_SIZE = 50;

export default class MapLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tileCache: new TileCache({source: this.props.source, size: CACHE_SIZE}),
      tiles: null,
      loadingTiles: null
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (props.source !== oldProps.source) {
      this.setState({
        tileCache: new TileCache({source: props.source, size: CACHE_SIZE})
      });
    }
    if (changeFlags.viewportChanged) {
      const {tileCache} = this.state;

      const tiles = getTileIndices(context.viewport).map(tileCache.getTile, tileCache);

      if (tiles.every(t => t.isLoaded) || !this.state.tiles) {
        this.setState({tiles});
      } else {
        this.setState({
          loadingTiles: tiles
        });
        Promise.all(tiles.map(t => t.getData())).then(() => {
          if (this.state.loadingTiles === tiles) {
            this.setState({tiles});
          }
        });
      }
    }
  }

  renderLayers() {
    const {tiles} = this.state;

    return (
      tiles &&
      tiles.map(
        (tile, i) =>
          new GeoJsonLayer(
            this.getSubLayerProps({
              id: `tile-${tile.x}-${tile.y}-${tile.z}`,
              // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
              // coordinateOrigin: tile.center,
              data: tile.getData(),
              pickable: true,
              ...this.props.style
            })
          )
      )
    );
  }
}

MapLayer.defaultProps = defaultProps;
