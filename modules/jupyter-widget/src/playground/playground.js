import {Transport} from '@deck.gl/json';

import {loadMapboxCSS, hideMapboxCSSWarning} from './utils/mapbox-utils';
import {createContainer, createErrorBox} from './utils/css-utils';

import {jsonConverter, createDeck} from './create-deck';

import {selectData} from './select-data';

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
        onClick: (datum, event) => selectData(transport, datum, event),
        // onViewportChange: ({viewState}) => handleViewStateChange(transport, viewState),
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
export function processDataBuffer({dataBuffer, convertedJson}) {
  for (let i = 0; i < convertedJson.layers.length; i++) {
    const layerId = convertedJson.layers[i].id;
    const layer = convertedJson.layers[i];
    // Replace data on every layer prop
    convertedJson.layers[i] = layer.clone({data: dataBuffer[layerId]});
  }
  return convertedJson;
}

// function handleViewStateChange(transport, viewport) {
//   console.log('seeing viewport', viewport);
//   transport.jupyterModel.set('viewport', JSON.stringify(''));
//   transport.jupyterModel.save_changes();
//   return viewport;
// }

// Handles a warning event
function handleWarning(transport, warningMessage) {
  const errorBox = createErrorBox();
  if (transport.jupyterModel.get('js_warning') && errorBox) {
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
