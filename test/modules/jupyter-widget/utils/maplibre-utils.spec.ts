// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import {ScatterplotLayer} from '@deck.gl/layers';
import {createMapLibreDeckOverlay} from '@deck.gl/jupyter-widget/playground/utils/maplibre-utils';

vi.mock('maplibre-gl', () => ({
  Map: class {
    on() {}
  },
  NavigationControl: class {}
}));

test('jupyter-widget: MapLibre overlay forwards layer updates', () => {
  const overlay = createMapLibreDeckOverlay({container: document.createElement('div'), layers: []});
  const layers = [new ScatterplotLayer({id: 'points', data: []})];

  overlay.setProps({layers, initialViewState: {longitude: 10, latitude: 10, zoom: 5}});

  expect(overlay._props.layers, 'Layers are forwarded to the overlay').toBe(layers);
  expect(overlay._props.initialViewState, 'Other props are not forwarded').toBeUndefined();
});
