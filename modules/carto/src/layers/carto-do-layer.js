import CartoLayer from './carto-layer';

const defaultProps = {
  sample: false
};

export default class CartoDOLayer extends CartoLayer {
  buildMapConfig() {
    return {
      version: '2.0.0',
      layers: [
        {
          type: 'tileset',
          source: 'data-observatory',
          options: {
            tileset: this.props.data,
            sample: this.props.sample
          }
        }
      ]
    };
  }
}

CartoDOLayer.layerName = 'CartoDOLayer';
CartoDOLayer.defaultProps = defaultProps;
