// This layer allows any deck.gl app to support user-defined JSON layers
import {CompositeLayer} from '@deck.gl/core';
// import DeckJSONConverter from '../deck-json-converter/deck-json-converter';
import DeckJSONConfiguration from '../../json-browser/deck-json-converter/deck-json-configuration';

const defaultProps = {
  // Accepts JSON strings by parsing them to JSON, naturally
  fetch: dataString => JSON.parse(dataString),
  configuration: {}
};

export default class JSONLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      converter: null, // new DeckJSONConverter()
      layers: [],
      configuration: {}
    };
  }

  updateState({props, oldProps, changeFlags}) {
    if (props.configuration !== oldProps.configuration) {
      this.setState({
        configuration: new DeckJSONConfiguration(this.props.configuration)
      });
    }

    const layersChanged = changeFlags.dataChanged || props.configuration !== oldProps.configuration;
    if (layersChanged) {
      this.state.layers = []; // getJSONLayers(props.data, this.state.configuration);
    }
  }

  renderLayers() {
    return this.state.layers;
  }
}

JSONLayer.layerName = 'JSONLayer';
JSONLayer.defaultProps = defaultProps;
