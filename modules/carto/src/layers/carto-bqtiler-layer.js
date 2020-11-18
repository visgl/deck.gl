import CartoLayer from './carto-layer';

export default class CartoBQTilerLayer extends CartoLayer {
  buildMapConfig() {
    return {
      version: '2.0.0',
      layers: [
        {
          type: 'tileset',
          source: 'bigquery',
          options: {
            tileset: this.props.data
          }
        }
      ]
    };
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
