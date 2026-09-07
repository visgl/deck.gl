// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document, queueMicrotask */
import {exposeGlobals} from './lib/globals';
import {deserializeMatrix} from './lib/utils/deserialize-matrix';
import {processDataBuffer, serializeEvent} from './lib/widget-utils';
import {createDeck, jsonConverter} from './playground/create-deck';
import {createContainer} from './playground/utils/css-utils';
import {loadMapboxCSS} from './playground/utils/mapbox-utils';

exposeGlobals();

function parseJsonInput(model) {
  const json = model.get('json_input');
  return json ? JSON.parse(json) : null;
}

/**
 * anywidget front-end module (AFM) for pydeck's `DeckGLWidget`.
 *
 * `render` runs once per view of the widget model: each view owns one deck.gl instance and its own
 * listeners. State flows Python -> JS through the synced `json_input` and `data_buffer` traits, and
 * JS -> Python through custom messages. This module never writes to model traits, so there is no
 * echo loop to guard against.
 */
export function renderWidget({model, el, signal}) {
  loadMapboxCSS();

  // createDeck adds support elements (e.g. the description card overlay) as siblings of the deck
  // container, so give it a wrapper owned by this view that can be removed as a unit.
  const root = document.createElement('div');
  const container = createContainer(model.get('width'), model.get('height'));
  root.appendChild(container);
  el.appendChild(root);

  const handleEvent = (type, data) => {
    const message = serializeEvent(type, data);
    if (message) {
      // A JSON string, parsed by DeckGLWidget._handle_custom_msgs on the Python side
      model.send(message);
    }
  };

  const deck = createDeck({
    mapboxApiKey: model.get('mapbox_key'),
    googleMapsKey: model.get('google_maps_key'),
    container,
    jsonInput: parseJsonInput(model) || {},
    tooltip: model.get('tooltip'),
    handleEvent,
    customLibraries: model.get('custom_libraries'),
    configuration: model.get('configuration'),
    showError: Boolean(model.get('show_error'))
  });

  let pending = false;
  const apply = () => {
    pending = false;
    if (signal.aborted || !deck) {
      return;
    }
    const jsonInput = parseJsonInput(model);
    if (!jsonInput) {
      return;
    }
    let props = jsonConverter.convert(jsonInput);
    const binary = deserializeMatrix(model.get('data_buffer'));
    if (binary) {
      props = processDataBuffer({binary, convertedJson: props});
    }
    deck.setProps(props);
  };

  // Deck.update() changes json_input and data_buffer in one sync, but the model still fires two
  // change events. Coalesce them so a layer never renders against a stale buffer.
  const scheduleApply = () => {
    if (!pending) {
      pending = true;
      queueMicrotask(apply);
    }
  };
  model.on('change:json_input', scheduleApply);
  model.on('change:data_buffer', scheduleApply);

  signal.addEventListener('abort', () => {
    model.off('change:json_input', scheduleApply);
    model.off('change:data_buffer', scheduleApply);
    if (deck) {
      deck.finalize();
    }
    root.remove();
  });

  return deck;
}

export default {render: renderWidget};
