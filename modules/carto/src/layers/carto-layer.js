import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const defaultProps = {
  data: null,
  credentials: null,
  onLoad: () => {},
  onError: err => console.error(err)
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
      this._updateData();
    }
  }

  async _updateData () {
    const { onError, onLoad } = this.props;
    try {
      await this._updateTileJSON();
      onLoad();
    } catch (err) {
      onError(err);
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

    const {updateTriggers} = this.props;

    return new MVTLayer(
      this.props,
      this.getSubLayerProps({
        id: 'mvt',
        data: this.state.tilejson.tiles,
        updateTriggers
      })
    );
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
