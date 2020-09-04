import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {instantiate} from './api/maps-api-client'

const defaultProps = {};
let test;

export default class CartoLayer extends CompositeLayer {

  initializeState() {
    // super.initializeState();
    test = instantiate('select * from populated_places');
  }

  renderLayers() {
    return new MVTLayer({
      data: test
    });
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
