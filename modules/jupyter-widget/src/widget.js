import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {
  createDeckScaffold,
  loadCss,
  hideMapboxCSSWarning,
  setMapProps,
  waitForElementToDisplay
} from './utils';

import {Deck, MapView} from '@deck.gl/core';
import * as deckLayers from '@deck.gl/layers';
import * as deckAggregationLayers from '@deck.gl/aggregation-layers';
import {_JSONConverter as JSONConverter} from '@deck.gl/json';

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.1/mapbox-gl.css';

// Note: Variables shared explictly between Python and JavaScript use camel-case
export class DeckGLModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: DeckGLModel.model_name,
      _model_module: DeckGLModel.model_module,
      _model_module_version: DeckGLModel.model_module_version,
      _view_name: DeckGLModel.view_name,
      _view_module: DeckGLModel.view_module,
      _view_module_version: DeckGLModel.view_module_version,
      json_input: null,
      mapbox_key: null,
      width: 500,
      height: 500
    };
  }

  static get serializers() {
    return {...DOMWidgetModel.serializers};
    // Add any extra serializers here
  }

  static get model_name() {
    return 'DeckGLModel';
  }
  static get model_module() {
    return MODULE_NAME;
  }
  static get model_module_version() {
    return MODULE_VERSION;
  }
  static get view_name() {
    return 'DeckGLView';
  }
  static get view_module() {
    return MODULE_NAME;
  }
  static get view_module_version() {
    return MODULE_VERSION;
  }
}

const TICK_RATE_MILLISECONDS = 100;

export class DeckGLView extends DOMWidgetView {
  render() {
    this.modelId = this.model.model_id;
    super.render();
    this.model.on('change:json_input', this.value_changed, this);
    loadCss(MAPBOX_CSS_URL);
    const [width, height] = [this.model.get('width'), this.model.get('height')];

    createDeckScaffold(this.el, this.modelId, width, height);

    waitForElementToDisplay(
      `#deck-map-wrapper-${this.modelId}`,
      TICK_RATE_MILLISECONDS,
      this.initJSElements.bind(this)
    );
  }

  _onViewStateChange({viewState}) {
    this.deck.setProps({viewState});
    setMapProps(this.mapLayer, {viewState});
  }

  initJSElements() {
    try {
      if (!this.deck) {
        this.deck = new Deck({
          canvas: `deck-map-container-${this.modelId}`,
          height: '100%',
          width: '100%',
          onLoad: this.value_changed.bind(this),
          views: [new MapView()],
          onViewStateChange: this._onViewStateChange.bind(this)
        });
      }

      if (!this.mapLayer) {
        const mapboxgl = require('mapbox-gl');

        mapboxgl.accessToken = this.model.get('mapbox_key');
        this.mapLayer = new mapboxgl.Map({
          container: `map-${this.modelId}`,
          interactive: false,
          style: null
        });
      }
    } catch (err) {
      // This will fail in node tests
      // eslint-disable-next-line
      console.error(err);
    }
  }

  value_changed() {
    this.json_input = this.model.get('json_input');
    const parsedJSONInput = JSON.parse(this.json_input);
    this.initJSElements();
    const jsonConverter = new JSONConverter({
      configuration: {
        layers: {...deckLayers, ...deckAggregationLayers}
      }
    });
    const results = jsonConverter.convertJsonToDeckProps(parsedJSONInput);
    this.deck.setProps(results);
    hideMapboxCSSWarning();
    setMapProps(this.mapLayer, this.deck.props);
  }
}
