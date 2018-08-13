import {CompositeLayer} from '@deck.gl/core';
import {getJSONLayers} from '../parsers/convert-json';

const defaultProps = {
  configuration: []
};

export default class JSONLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      layers: []
    };
  }

  updateState({props, oldProps}) {
    const layersChanged =
      props.data !== oldProps.data || props.configuration !== oldProps.configuration;

    if (layersChanged) {
      // Optionally accept JSON strings by parsing them
      const data = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
      this.state.layers = getJSONLayers(data, props.configuration);
    }
  }

  renderLayers() {
    return this.state.layers;
  }
}

JSONLayer.layerName = 'JSONLayer';
JSONLayer.defaultProps = defaultProps;
