import CartoLayer from './carto-layer';

const BQ_TILEJSON_ENDPOINT = 'https://us-central1-cartobq.cloudfunctions.net/tilejson';

export default class CartoBQTilerLayer extends CartoLayer {
  async _updateTileJSON() {
    /* global fetch */
    /* eslint no-undef: "error" */
    const response = await fetch(`${BQ_TILEJSON_ENDPOINT}?t=${this.props.data}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const tilejson = await response.json();
    this.setState({tilejson});
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
