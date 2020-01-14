/* global document */
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {MODULE_NAME, MODULE_VERSION} from './version';

import {createDeck, updateDeck} from './create-deck';

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css';
const ERROR_BOX_CLASSNAME = 'error-box';

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

function dtypeToTypedArray(dtype, data) {
  switch (dtype) {
    case 'int8':
      return new Int8Array(data);
    case 'uint8':
      return new Uint8Array(data);
    case 'int16':
      return new Int16Array(data);
    case 'uint16':
      return new Uint16Array(data);
    case 'float32':
      return new Float32Array(data);
    case 'float64':
      return new Float64Array(data);
    case 'int32':
      return new Int32Array(data);
    case 'uint32':
      return new Uint32Array(data);
    case 'int64':
      return new BigInt64Array(data); // eslint-disable-line no-undef
    case 'uint64':
      return new BigUint64Array(data); // eslint-disable-line no-undef
    default:
      throw new Error(`Unrecognized dtype ${dtype}`);
  }
}

function deserializeMatrix(arr, manager) {
  if (!arr) {
    return null;
  }
  return {data: dtypeToTypedArray(arr.dtype, arr.data.buffer), shape: arr.shape};
}

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
      selected_data: [],
      data_buffer: null,
      tooltip: null,
      width: '100%',
      height: 500,
      js_warning: false
    };
  }

  static get serializers() {
    return {
      ...DOMWidgetModel.serializers,
      // Add any extra serializers here
      data_buffer: {deserialize: deserializeMatrix}
    };
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

    if (this.model.get('js_warning')) {
      const errorBox = addErrorBox();
      container.append(errorBox);
    }

    loadCss(MAPBOX_CSS_URL);
    this.deck = createDeck({
      mapboxApiKey,
      container,
      jsonInput,
      tooltip,
      handleClick: this.handleClick.bind(this),
      handleWarning: this.handleWarning.bind(this)
    });
  }

  remove() {
    if (this.deck) {
      this.deck.finalize();
      this.deck = null;
    }
  }

  render() {
    super.render();

    this.model.on('change:json_input', this.valueChanged.bind(this), this);
    this.model.on('change:data_buffer', this.dataBufferChanged.bind(this), this);
  }

  dataBufferChanged() {
    // Current method for review:
    // Copy layer configuration
    if (this.model.get('data_buffer')) {
      const cleanBuffer = this.model.get('data_buffer');
      const rowMajorOrderMatrix = cleanBuffer.data;
      const [h, w] = cleanBuffer.shape;

      // TESTING ONLY
      const LayerConstructor = this.deck.props.layers[0].__proto__.constructor; // eslint-disable-line
      const layerProps = this.deck.props.layers[0].props;

      const newDataProps = {
        // this is required so that the layer knows how many points to draw
        data: {src: rowMajorOrderMatrix, length: h},
        getPosition: (object, {index, data, target}) => {
          target[0] = data.src[index * w];
          target[1] = data.src[index * w + 1];
          target[2] = data.src[index * w + 2];
          return target;
        },
        getColor: (object, {index, data, target}) => {
          target[0] = data.src[index * w + 3];
          target[1] = data.src[index * w + 4];
          target[2] = data.src[index * w + 5];
          target[3] = 140; // alpha
          return target;
        }
      };

      const newLayer = new LayerConstructor({...layerProps, ...newDataProps});
      this.deck.setProps({layers: [newLayer]});
    }
  }

  valueChanged() {
    updateDeck(JSON.parse(this.model.get('json_input')), this.deck);
    // Jupyter notebook displays an error that this suppresses
    hideMapboxCSSWarning();
  }

  handleClick(datum, e) {
    if (!datum || !datum.object) {
      this.model.set('selected_data', JSON.stringify(''));
      this.model.save_changes();
      return;
    }
    const multiselectEnabled = e.srcEvent.metaKey || e.srcEvent.metaKey;
    const dataPayload = datum.object && datum.object.points ? datum.object.points : datum.object;
    if (multiselectEnabled) {
      let selectedData = JSON.parse(this.model.get('selected_data'));
      if (!Array.isArray(selectedData)) {
        selectedData = [];
      }
      selectedData.push(dataPayload);
      this.model.set('selected_data', JSON.stringify(selectedData));
    } else {
      // Single selection
      this.model.set('selected_data', JSON.stringify(dataPayload));
    }
    this.model.save_changes();
  }

  handleWarning(warningMessage) {
    const errorBox = this.el.getElementsByClassName(ERROR_BOX_CLASSNAME)[0];
    if (this.model.get('js_warning') && errorBox) {
      errorBox.innerText = warningMessage;
    }
  }
}

function addErrorBox() {
  const errorBox = document.createElement('div');
  errorBox.className = ERROR_BOX_CLASSNAME;
  Object.assign(errorBox.style, {
    width: '100%',
    height: '20px',
    position: 'absolute',
    zIndex: '1000',
    backgroundColor: 'lemonchiffon',
    cursor: 'pointer'
  });
  errorBox.onclick = e => {
    errorBox.style.display = 'none';
  };
  return errorBox;
}
