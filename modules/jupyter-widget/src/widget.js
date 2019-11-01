/* global document */
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {loadCss, hideMapboxCSSWarning, initDeck, updateDeck} from './utils';

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
      tooltip: null,
      width: '100%',
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
  initialize() {
    this.listenTo(this.model, 'destroy', this.remove);

    const container = document.createElement('div');

    this.el.appendChild(container);

    const height = `${this.model.get('height')}px`;
    const width = Number.isFinite(this.model.get('width'))
      ? `${this.model.get('width')}px`
      : this.model.get('width');
    container.style.width = width;
    container.style.height = height;
    container.style.position = 'relative';

    const mapboxApiKey = this.model.get('mapbox_key');
    const jsonInput = JSON.parse(this.model.get('json_input'));
    const tooltip = this.model.get('tooltip');

    loadCss(MAPBOX_CSS_URL);
    initDeck({
      mapboxApiKey,
      container,
      jsonInput,
      tooltip,
      onComplete: ({jsonConverter, deckgl}) => {
        this.jsonDeck = {jsonConverter, deckgl};
      },
      handleClick: this.handleClick.bind(this)
    });
  }

  remove() {
    if (this.jsonDeck) {
      this.jsonDeck.deckgl.finalize();
      this.jsonDeck = null;
    }
  }

  render() {
    super.render();
    this.model.on('change:json_input', this.valueChanged.bind(this), this);
  }

  valueChanged() {
    updateDeck(JSON.parse(this.model.get('json_input')), this.jsonDeck);
    // Jupyter notebook displays an error that this suppresses
    hideMapboxCSSWarning();
  }

  handleClick(e) {
    if (!e) {
      return;
    }
    if (e.object && e.object.points) {
      this.model.set('selected_data', e.object.points);
    } else {
      this.model.set('selected_data', e.object);
    }
    this.model.save_changes();
  }
}
