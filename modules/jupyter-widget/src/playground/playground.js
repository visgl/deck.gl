import {Transport} from '@deck.gl/json';

import {createContainer, createErrorBox} from './utils/css-utils';

import {loadMapboxCSS} from './utils/mapbox-utils';

import {jsonConverter, createDeck} from './create-deck';

export function initPlayground() {
  Transport.setCallbacks({
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
      transport.jupyterView.el.appendChild(container);

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
        handleEvent: (name, payload) => sendEventViaTransport(transport, name, payload),
        handleClick: (datum, event) => handleClick(transport, datum, event),
        handleWarning: message => handleWarning(transport, message),
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
      let convertedJson;
      switch (type) {
        case 'json':
          convertedJson = jsonConverter.convert(json);
          deck.setProps(convertedJson);
          break;

        case 'json-with-binary':
          convertedJson = jsonConverter.convert(json);
          const binaryData = transport.jupyterModel.get('data_buffer');
          const propsWithBinary = processDataBuffer({
            binary: binaryData,
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
export function processDataBuffer({binary, convertedJson}) {
  for (let i = 0; i < convertedJson.layers.length; i++) {
    const layerId = convertedJson.layers[i].id;
    const layer = convertedJson.layers[i];
    // Replace data on every layer prop
    convertedJson.layers[i] = layer.clone({data: binary[layerId]});
  }
  return convertedJson;
}

// Skips keys in a Deck layer that induce a circular reference on JSON serialization
function filterJsonValue(key, value) {
  if (value instanceof 'Layer') {
    return value.id;
  }
  return value;
}

// Handles a general event
function sendEventViaTransport(transport, name, data) {
  transport.jupyterModel.set('deck_event', JSON.stringify({name, data}, filterJsonValue));
  transport.jupyterModel.save_changes();
}

// Handles a click event
// TODO - integrate as extra processing for click events in sendEventViaTransport
function handleClick(transport, datum, e) {
  if (!datum || !datum.object) {
    transport.jupyterModel.set('selected_data', JSON.stringify(''));
    transport.jupyterModel.save_changes();
    return;
  }

  const multiselectEnabled = e.srcEvent.metaKey || e.srcEvent.metaKey;
  const dataPayload = datum.object && datum.object.points ? datum.object.points : datum.object;
  if (multiselectEnabled) {
    let selectedData = JSON.parse(transport.jupyterModel.get('selected_data'));
    if (!Array.isArray(selectedData)) {
      selectedData = [];
    }
    selectedData.push(dataPayload);
    transport.jupyterModel.set('selected_data', JSON.stringify(selectedData));
  } else {
    // Single selection
    transport.jupyterModel.set('selected_data', JSON.stringify(dataPayload));
  }
  transport.jupyterModel.save_changes();
}

// Handles a warning event
function handleWarning(transport, warningMessage) {
  const errorBox = createErrorBox();
  const model = transport.jupyterModel;
  if (model && model.attributes.js_warning && errorBox) {
    errorBox.innerText = warningMessage;
  }
}

// Get non-deck "playground" props
// TODO: hack we are accessing model directly
// TODO - these inputs can be passed as top-level JSON props, no need to add custom model fields

function getPlaygroundProps(transport) {
  const {jupyterModel} = transport;
  if (!jupyterModel) {
    throw new Error('deck.gl playground currently only works with the Jupyter Widget Transport');
  }

  return {
    width: jupyterModel.get('width'),
    height: jupyterModel.get('height'),

    customLibraries: jupyterModel.get('custom_libraries'),

    mapboxApiKey: jupyterModel.get('mapbox_key'),
    jsonInput: jupyterModel.get('json_input'),
    tooltip: jupyterModel.get('tooltip'),

    jsWarning: jupyterModel.get('js_warning')
  };
}
