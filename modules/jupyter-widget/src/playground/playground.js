import * as deckBundle from '../deck-bundle';

import {Transport} from '@deck.gl/json';

import {createContainer} from './utils/css-utils';

import {loadMapboxCSS} from './utils/mapbox-utils';

import {jsonConverter, createDeck} from './create-deck';

export function initPlayground() {
  Transport.setCallbacks({
    onInitialize({transport}) {
      // Extract "deck.gl playground" props
      const {width, height, customLibraries, mapboxApiKey, jsonInput, tooltip} = getPlaygroundProps(
        transport
      );

      // Load mapbox CSS
      loadMapboxCSS();

      // Create container div for deck.gl
      const transportRootElement = transport.getRootDOMElement();
      const deckContainer = createContainer(width, height);
      transportRootElement.appendChild(deckContainer);

      const jsonProps = JSON.parse(jsonInput);

      const deck = createDeck({
        mapboxApiKey,
        container: deckContainer,
        jsonInput: jsonProps,
        tooltip,
        handleEvent: (name, payload) => sendEventViaTransport(transport, name, payload),
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

// Filters circular references on JSON string conversion
function filterJsonValue(key, value) {
  return value instanceof deckBundle.Layer ? value.id : value;
}

// Handles a general event
function sendEventViaTransport(transport, eventName, data) {
  if (eventName === 'hover' && !data.picked && data.index === -1) {
    // TODO handle background hover events, for now we'll skip them
    return;
  }

  // TODO Remove circular references without converting to a string
  const deckEvent = JSON.parse(JSON.stringify(data, filterJsonValue));

  // Note: transport.sendJSONMessage now filters circular references
  transport.sendJSONMessage(eventName, deckEvent);
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
    tooltip: jupyterModel.get('tooltip')
  };
}
