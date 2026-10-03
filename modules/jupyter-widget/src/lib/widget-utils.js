// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer} from '@deck.gl/core';
import {Transport} from '@deck.gl/json';

/**
 * Attaches binary attribute data transferred from Python to the converted layers.
 * Layers without an entry in `binary` are left untouched.
 */
export function processDataBuffer({binary, convertedJson}) {
  const layers = convertedJson.layers || [];
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const data = layer && binary[layer.id];
    if (data) {
      layers[i] = layer.clone({data});
    }
  }
  return convertedJson;
}

// Layers are not serializable; send their ids instead
function filterJsonValue(key, value) {
  return value instanceof Layer ? value.id : value;
}

/**
 * Serializes a deck.gl event for the Python side.
 * Returns the JSON string to send over the widget comm, or null for events that are dropped.
 * The Python side (`DeckGLWidget._handle_custom_msgs`) expects a JSON string of `{type, data}`.
 */
export function serializeEvent(type, data) {
  if (type === 'deck-hover-event' && !data.picked && data.index === -1) {
    // Background hover events are too chatty to forward to the kernel
    return null;
  }
  const deckEvent = JSON.parse(JSON.stringify(data, filterJsonValue));
  return Transport._stringifyJSONSafe({type, data: deckEvent});
}
