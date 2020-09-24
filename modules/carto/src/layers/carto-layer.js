import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const defaultProps = {
  data: null,
  credentials: null
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tilejson: null
    };
  }

  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._updateTileJSON();
    }
  }

  async _updateTileJSON() {
    throw new Error(`You must use one of the specific carto layers: BQ or SQL type`);
  }

  onHover(info, pickingEvent) {
    const [mvtLayer] = this.getSubLayers();
    return mvtLayer ? mvtLayer.onHover(info, pickingEvent) : super.onHover(info, pickingEvent);
  }

  renderLayers() {
    if (!this.state.tilejson) return null;

    return new MVTLayer(
      this.props,
      this.getSubLayerProps({
        id: 'mvt',
        data: this.state.tilejson.tiles
      })
    );
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
