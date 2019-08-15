import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {loadCss, createWidgetDiv, hideMapboxCSSWarning} from './utils';

/* global window */
const deckgl = window.deck;
const mapboxgl = window.mapboxgl;

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.1/mapbox-gl.css';

// Note: Variables shared explictly between Python and JavaScript use snake_case
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

export class DeckGLView extends DOMWidgetView {
  render() {
    this.modelId = this.model.model_id;
    super.render();
    this.model.on('change:json_input', this.value_changed, this);
    loadCss(MAPBOX_CSS_URL);

    this.el.id = this.model.id;

    createWidgetDiv(this.el, this.modelId, this.model.get('width'), this.model.get('height'));
  }

  _onViewStateChange({viewState}) {
    this.deck.setProps({viewState});
  }

  initJSElements() {
    try {
      if (!this.deck) {
        this.deck = new deckgl.Deck({
          mapboxAccessToken: '',
          map: mapboxgl,
          mapboxApiAccessToken: this.model.get('mapbox_key'),
          canvas: `deck-map-container-${this.modelId}`,
          height: '100%',
          width: '100%',
          onLoad: this.value_changed.bind(this),
          views: [new deckgl.MapView()],
          onViewStateChange: this._onViewStateChange.bind(this),
          mapStyle: null
        });
      }
      this.jsonConverter = new deckgl.JSONConverter({
        configuration: {
          layers: {...deckgl.deckLayers, ...deckgl.deckAggregationLayers}
        }
      });
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
    const results = this.jsonConverter.convertJsonToDeckProps(parsedJSONInput);
    this.deck.setProps(results);
    hideMapboxCSSWarning();
  }
}
