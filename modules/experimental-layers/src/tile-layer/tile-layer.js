import {GeoJsonLayer, CompositeLayer} from 'deck.gl';
import TileCache from './utils/tile-cache';

const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,

  elevationScale: 1,

  pointRadiusScale: 1,
  pointRadiusMinPixels: 0, //  min point radius in pixels
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels

  lineDashJustified: false,
  fp64: false,

  // Line and polygon outline color
  getLineColor: defaultLineColor,
  // Point and polygon fill color
  getFillColor: defaultFillColor,
  // Point radius
  getRadius: 1,
  // Line and polygon outline accessors
  getLineWidth: 1,
  // Line dash array accessor
  getLineDashArray: null,
  // Polygon extrusion accessor
  getElevation: 1000,

  renderSubLayers: props => new GeoJsonLayer(props)
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
