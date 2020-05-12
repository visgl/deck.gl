import {jupyterKernelTransport} from '../transports/jupyter/jupyter-kernel-transport';

import {loadMapboxCSS, hideMapboxCSSWarning} from './utils/mapbox-utils';
import {createContainer, createErrorBox} from './utils/css-utils';

import {jsonConverter, createDeck} from './create-deck';

export function initPlayground() {
  jupyterKernelTransport.setCallbacks({
    onInitialize({transport}) {
      // Extract "deck.gl playground" props
      const {
        width,
        height,
        customLibraries,
        mapboxApiKey,
        jsonInput,
        tooltip,
        jsWarning
      } = getPlaygroundProps(transport);

      // Load mapbox CSS
      loadMapboxCSS();

      // Create container div for deck.gl
      const container = createContainer(width, height);
      this.el.appendChild(container);

      if (jsWarning) {
        const errorBox = createErrorBox(jsWarning);
        container.append(errorBox);
      }

      const jsonProps = JSON.parse(jsonInput);

      const deck = createDeck({
        mapboxApiKey,
        container,
        jsonInput: jsonProps,
        tooltip,
        handleClick: (datum, event) => handleClick(this.transport, datum, event),
        handleWarning: message => handleWarning(this.transport, message),
        customLibraries
      });

      transport.userData.deck = deck;
    },

    onFinalize({transport}) {
      const {deck} = transport.userData;
      deck.finalize();
    },

    onMessage({transport, type, json, binary}) {
      const {deck} = transport.userData;

      switch (type) {
        case 'json':
          let convertedJson = jsonConverter.convert(json);
          deck.setProps(convertedJson);

          // Jupyter notebook displays an error that this suppresses
          hideMapboxCSSWarning();
          break;

        case 'json-with-binary':
          convertedJson = jsonConverter.convert(json);
          const propsWithBinary = processDataBuffer({
            binary,
            convertedJson
          });
          deck.setProps(propsWithBinary);
          break;

        default:
        // console.warn(type)
      }
    }
  });
}

// HELPER FUNCTIONS

// Takes JSON props and combines them with the binary data buffer
function processDataBuffer({dataBuffer, convertedJson}) {
  for (let i = 0; i < convertedJson.layers.length; i++) {
    const layerId = convertedJson.layers[i].id;
    const layer = convertedJson.layers[i];
    // Replace data on every layer prop
    convertedJson.layers[i] = layer.clone({data: dataBuffer[layerId]});
  }
  return convertedJson;
}

// Handles a click event
function handleClick(transport, datum, e) {
  if (!datum || !datum.object) {
    transport.model.set('selected_data', JSON.stringify(''));
    transport.model.save_changes();
    return;
  }

  const multiselectEnabled = e.srcEvent.metaKey || e.srcEvent.metaKey;
  const dataPayload = datum.object && datum.object.points ? datum.object.points : datum.object;
  if (multiselectEnabled) {
    let selectedData = JSON.parse(transport.model.get('selected_data'));
    if (!Array.isArray(selectedData)) {
      selectedData = [];
    }
    selectedData.push(dataPayload);
    transport.model.set('selected_data', JSON.stringify(selectedData));
  } else {
    // Single selection
    transport.model.set('selected_data', JSON.stringify(dataPayload));
  }
  transport.model.save_changes();
}

// Handles a warning event
function handleWarning(transport, warningMessage) {
  const errorBox = createErrorBox();
  if (transport.model.get('js_warning') && errorBox) {
    errorBox.innerText = warningMessage;
  }
}

// Get non-deck "playground" props
// TODO: hack we are accessing model directly
// TODO - these inputs can be passed as top-level JSON props, no need to add custom model fields

function getPlaygroundProps(transport) {
  const {model} = transport;
  if (!model) {
    throw new Error('deck.gl playground currently only works with the Jupyter Widget Transport');
  }

  return {
    width: model.get('width'),
    height: model.get('height'),

    customLibraries: model.get('custom_libraries'),

    mapboxApiKey: model.get('mapbox_key'),
    jsonInput: model.get('json_input'),
    tooltip: model.get('tooltip'),

    jsWarning: model.get('js_warning')
  };
}
