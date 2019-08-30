/* global document */
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {loadCss, hideMapboxCSSWarning} from './utils';

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css';

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
      selected_data: null,
      initialized: false,
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
    this.model.on('change:json_input', this.valueChanged.bind(this), this);
    const initialized = this.model.get('initialized');

    const containerDiv = document.createElement('div');

    if (!initialized) {
      containerDiv.style.height = `${this.model.get('height')}px`;
      containerDiv.style.width = `${this.model.get('width')}px`;
      this.el.appendChild(containerDiv);

      loadCss(MAPBOX_CSS_URL);
      initDeck(
        {
          mapboxApiKey: this.model.get('mapbox_key'),
          container: containerDiv,
          jsonInput: JSON.parse(this.model.get('json_input'))
        },
        this,
        this.handleClick.bind(this)
      );
      this.model.set('initialized', true);
    }
  }

  valueChanged() {
    updateDeck(JSON.parse(this.model.get('json_input')), this.jsonDeck);
    // Jupyter notebook displays an error that this suppresses
    hideMapboxCSSWarning();
  }

  handleClick(e) {
    console.table(e); // eslint-disable-line
    this.model.set('selected_data', e.object.points);
    this.model.save_changes();
  }
}

function updateDeck(inputJSON, {jsonConverter, deckConfig}) {
  const results = jsonConverter.convertJsonToDeckProps(inputJSON);
  deckConfig.setProps(results);
}

export function initDeck({mapboxApiKey, container, jsonInput}, context, handleClick) {
  require(['mapbox-gl', 'h3', 'S2'], mapboxgl => {
    require(['deck.gl'], deckgl => {
      try {
        const layersDict = {};
        const layers = Object.keys(deckgl).filter(
          x => x.indexOf('Layer') > 0 && x.indexOf('_') !== 0
        );
        layers.map(k => (layersDict[k] = deckgl[k]));

        const jsonConverter = new deckgl._JSONConverter({
          configuration: {
            layers: layersDict
          }
        });

        const deckConfig = new deckgl.DeckGL({
          map: mapboxgl,
          mapboxApiAccessToken: mapboxApiKey,
          latitude: 0,
          longitude: 0,
          zoom: 1,
          onClick: handleClick,
          container,
          onLoad: () => updateDeck(jsonInput, {jsonConverter, deckConfig})
        });
        context.jsonDeck = {jsonConverter, deckConfig};
        return {jsonConverter, deckConfig};
      } catch (err) {
        // This will fail in node tests
        // eslint-disable-next-line
        console.error(err);
      }
      return {};
    });
  });
}
