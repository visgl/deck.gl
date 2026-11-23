// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapView, FirstPersonView, MapController} from '@deck.gl/core';
import * as deckglLayers from '@deck.gl/layers';

export const log = console; // eslint-disable-line

export function calculateRadius({base, exponent}) {
  return Math.pow(base, exponent);
}

export const JSON_CONFIGURATION = {
  log,
  // a map of all layers that should be exposes as JSONLayers
  classes: Object.assign({MapView, FirstPersonView}, deckglLayers),
  // Functions that should be executed by JSON converter
  functions: Object.assign({calculateRadius}),
  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    Primitive: {TRIANGLES: 'triangle-list'}
  },
  constants: {
    MapController
  }
};
