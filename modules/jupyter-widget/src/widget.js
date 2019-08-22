import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {loadCss, createWidgetDiv, setDependencies, hideMapboxCSSWarning} from './utils';

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
    super.render();
    this.model.on('change:json_input', this.value_changed, this);
    loadCss(MAPBOX_CSS_URL);

    this.el.id = this.model.model_id;

    createWidgetDiv({
      parentDiv: this.el,
      idName: this.model.model_id,
      done: this.initDeckElements.bind(this),
      width: this.model.get('width'),
      height: this.model.get('height')
    });
  }

  initDeckElements() {
    this._initDeck = this._initDeck.bind(this);
    setDependencies(this._initDeck);
  }

  _initDeck(deckgl, mapboxgl) {
    try {
      const layersDict = {};
      const layers = Object.keys(deckgl).filter(
        x => x.indexOf('Layer') > 0 && x.indexOf('_') !== 0
      );
      layers.map(k => (layersDict[k] = deckgl[k]));

      this.jsonConverter = new deckgl._JSONConverter({
        configuration: {
          layers: layersDict
        }
      });

      this.deckVis = new deckgl.DeckGL({
        map: mapboxgl,
        mapboxApiAccessToken: this.model.get('mapbox_key'),
        latitude: 0,
        longitude: 0,
        zoom: 1,
        container: `${this.model.model_id}`,
        onLoad: this.value_changed.bind(this)
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
    const results = this.jsonConverter.convertJsonToDeckProps(parsedJSONInput);
    this.deckVis.setProps(results);
    hideMapboxCSSWarning();
  }
}
