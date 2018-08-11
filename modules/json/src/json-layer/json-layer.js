import {CompositeLayer} from '@deck.gl/core';
import {get} from '../utils/get';
import {csvParseRows} from 'd3-dsv';

const defaultProps = {
  layerCatalog: []
};

export default class JSONLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      layers: []
    };
  }

  updateState({props, oldProps}) {
    const layersChanged =
      props.data !== oldProps.data || props.layerCatalog !== oldProps.layerCatalog;

    if (layersChanged) {
      // Optionally accept JSON strings by parsing them
      const data = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
      this.state.layers = this._getJSONLayers(data, props.layerCatalog);
    }
  }

  _getJSONLayers(jsonLayers = [], layerCatalog) {
    // assert(Array.isArray(jsonLayers));
    return jsonLayers.map(jsonLayer => {
      const Layer = layerCatalog[jsonLayer.type];
      const props = this._getJSONLayerProps(jsonLayer);
      props.fetch = enhancedFetch;
      return Layer && new Layer(props);
    });
  }

  // Replaces accessor props
  _getJSONLayerProps(jsonProps) {
    const replacedProps = {};
    for (const propName in jsonProps) {
      // eslint-disable-line guard-for-in
      const propValue = jsonProps[propName];
      // Handle accessors
      if (propName.startsWith('get')) {
        replacedProps[propName] = this._getJSONAccessor(propValue);
      } else {
        replacedProps[propName] = propValue;
      }
    }
    return replacedProps;
  }

  // Calculates an accessor function from a JSON string
  // '-' : x => x
  // 'a.b.c': x => x.a.b.c
  _getJSONAccessor(propValue) {
    if (propValue === '-') {
      return object => object;
    }
    if (typeof propValue === 'string') {
      return object => {
        return get(object, propValue);
      };
    }
    return propValue;
  }

  renderLayers() {
    return this.state.layers;
  }
}

JSONLayer.layerName = 'jsonLayer';
JSONLayer.defaultProps = defaultProps;


function enhancedFetch(url) {
  /* global fetch */
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        const csv = csvParseRows(text);
        console.log(csv);
        debugger;
        return csv;
      }
    });
}
