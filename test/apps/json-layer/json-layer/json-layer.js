// This layer allows any deck.gl app to support user-defined JSON layers
import {CompositeLayer} from '@deck.gl/core';
import {JSONConverter, JSONConfiguration} from '@deck.gl/json';

import {
  MapView,
  FirstPersonView,
  OrbitView,
  OrthographicView,
  COORDINATE_SYSTEM
} from '@deck.gl/core';
import * as layers from '@deck.gl/layers';
import GL from '@luma.gl/constants';

const DEFAULT_CONFIGURATION = {
  classes: Object.assign({MapView, FirstPersonView, OrbitView, OrthographicView}, layers),
  enumerations: {COORDINATE_SYSTEM, GL}
};

const defaultProps = {
  // Accepts JSON strings by parsing them to JSON, naturally
  fetch: dataString => JSON.parse(dataString),
  configuration: {}
};

export default class JSONLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      jsonConverter: new JSONConverter({
        configuration: new JSONConfiguration(DEFAULT_CONFIGURATION, this.props.configuration)
      }),
      layers: []
    };
  }

  updateState({props, oldProps, changeFlags}) {
    const layersChanged = changeFlags.dataChanged || props.configuration !== oldProps.configuration;
    if (layersChanged) {
      this.state.layers = this.state.jsonConverter.convert(props.data);
    }
  }

  renderLayers() {
    return this.state.layers;
  }
}

JSONLayer.layerName = 'JSONLayer';
JSONLayer.defaultProps = defaultProps;
