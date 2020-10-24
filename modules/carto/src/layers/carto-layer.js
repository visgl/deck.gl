import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {getTileJSON} from '../api/maps-api-client';

const defaultProps = {
  data: null,
  credentials: null,
  onDataLoad: {type: 'function', value: tilejson => {}, compare: false},
  // eslint-disable-next-line
  onDataError: {type: 'function', value: err => console.error(err), compare: false}
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

  async _updateData() {
    try {
      const tilejson = await this._updateTileJSON();
      this.setState({tilejson});
      this.props.onDataLoad(tilejson);
    } catch (err) {
      this.props.onDataError(err);
    }
  }

  buildMapConfig() {
    throw new Error('You must use one of the specific carto layers: BQ or SQL type');
  }

  async _updateTileJSON() {
    const tilejson = await getTileJSON(this.buildMapConfig(this.props), this.props.credentials);
    return tilejson;
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
        data: this.state.tilejson,
        updateTriggers
      })
    );
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
