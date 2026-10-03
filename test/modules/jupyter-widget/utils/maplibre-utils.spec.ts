// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {forwardLayerUpdates} from '@deck.gl/jupyter-widget/playground/utils/overlay-utils';

test('jupyter-widget: MapLibre overlay forwards layer updates', () => {
  // The overlay is not attached to a map: creating one needs a WebGL context, which other specs
  // in the shared headless page cannot share
  const overlay = forwardLayerUpdates(new MapLibreOverlay({layers: []}));
  const layers = [new ScatterplotLayer({id: 'points', data: []})];

  overlay.setProps({layers, initialViewState: {longitude: 10, latitude: 10, zoom: 5}});

  expect(overlay._props.layers, 'Layers are forwarded to the overlay').toBe(layers);
  expect(overlay._props.initialViewState, 'Other props are not forwarded').toBeUndefined();
});
