import {CompositeLayer, GeoJsonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultProps = {
  opacity: 1,
  source: null,
  layerStyles: []
};

const CACHE_SIZE = 40;

export default class MapLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tileCache: new TileCache({
        source: this.props.source,
        size: CACHE_SIZE
      }),
      tiles: []
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (props.source !== oldProps.source) {
      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({source: props.source, size: CACHE_SIZE})
      });
    }
    if (changeFlags.viewportChanged) {
      this.state.tileCache.update(context.viewport, (tiles) => this.setState({tiles}));
    }
  }

  renderLayers() {
    const {tiles} = this.state;

    return tiles.map((tile, i) =>
      new GeoJsonLayer({
        ...this.props,
        opacity: 1,
        id: `${tile.x}-${tile.y}-${tile.z}`,
        data: tile.data,
        visible: tile.isVisible,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: tile.center
      })
    );
  }
}

MapLayer.defaultProps = defaultProps;
