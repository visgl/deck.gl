import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';


const defaultProps = {

};


export default class CartoLayer extends CompositeLayer {

  renderLayers() {
    return new MVTLayer(this.props);
  }

}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
