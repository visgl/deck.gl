"use strict";module.export({default:()=>JSONLayer});var CompositeLayer;module.link('@deck.gl/core',{CompositeLayer(v){CompositeLayer=v}},0);var getJSONLayers;module.link('../parsers/convert-json',{getJSONLayers(v){getJSONLayers=v}},1);


const defaultProps = {
  configuration: []
};

class JSONLayer extends CompositeLayer {
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
