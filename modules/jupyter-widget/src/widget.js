import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {
  createDeckScaffold,
  loadCss,
  hideMapboxCSSWarning,
  setMapProps,
  waitForElementToDisplay
} from './utils';

const mapboxgl = require('mapbox-gl');
const deckgl = require('@deck.gl/core');
const deckglLayers = require('@deck.gl/layers');
const deckAggregationLayers = require('@deck.gl/aggregation-layers');
const deckJson = require('@deck.gl/json');

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.1/mapbox-gl.css';

export class DeckGLModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: DeckGLModel.model_name,
      _model_module: DeckGLModel.model_module,
      _model_module_version: DeckGLModel.model_module_version,
      _view_name: DeckGLModel.view_name,
      _view_module: DeckGLModel.view_module,
      _view_module_version: DeckGLModel.view_module_version
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
    this.listenTo(this.model, 'change:json_input', this.value_changed);
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
    if (!this.deck) {
      mapboxgl.accessToken = this.model.get('mapbox_key');
      this.deck = new deckgl.Deck({
        canvas: `deck-map-container-${this.modelId}`,
        height: '100%',
        width: '100%',
        onLoad: this.value_changed.bind(this),
        mapboxApiAccessToken: mapboxgl.accessToken,
        views: [new deckgl.MapView()],
        onViewStateChange: this._onViewStateChange.bind(this)
      });
    }

    if (!this.mapLayer) {
      this.mapLayer = new mapboxgl.Map({
        container: `map-${this.modelId}`,
        interactive: false,
        style: null
      });
    }
  }

  value_changed() {
    this.json_input = this.model.get('json_input');
    const parsedJSONInput = JSON.parse(this.json_input);
    this.initJSElements();
    const jsonConverter = new deckJson._JSONConverter({
      configuration: {
        layers: {...deckglLayers, ...deckAggregationLayers}
      }
    });
    const results = jsonConverter.convertJsonToDeckProps(parsedJSONInput);
    this.deck.setProps(results);
    hideMapboxCSSWarning();
    setMapProps(this.mapLayer, this.deck.props);
  }
}
