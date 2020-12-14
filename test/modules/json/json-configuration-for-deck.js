import {COORDINATE_SYSTEM, MapView, FirstPersonView, MapController} from '@deck.gl/core';
import GL from '@luma.gl/constants';

export const log = console; // eslint-disable-line

export function calculateRadius({base, exponent}) {
  return Math.pow(base, exponent);
}

export default {
  log,
  // a map of all layers that should be exposes as JSONLayers
  classes: Object.assign({MapView, FirstPersonView}, require('@deck.gl/layers')),
  // Functions that should be executed by JSON converter
  functions: Object.assign({calculateRadius}),
  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL
  },
  constants: {
    MapController
  }
};
