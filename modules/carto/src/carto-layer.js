import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {instantiate} from './api/maps-api-client'

const defaultProps = {};
let test;

export default class CartoLayer extends CompositeLayer {

  initializeState() {
    super.initializeState();
    this._instantiate();
  }

  async _instantiate() {
    const r = await instantiate('select * from populated_places');
    this.setState({ data: r });
  }

  renderLayers() {
    if (!this.state.data)
      return;

    return new MVTLayer({
      ...this.props,
      data: this.state.data 
    });
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;