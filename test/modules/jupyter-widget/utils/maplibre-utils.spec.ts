// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {test, expect, vi} from 'vitest';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {getVersion} from 'maplibre-gl';
import {forwardLayerUpdates} from '@deck.gl/jupyter-widget/playground/utils/overlay-utils';
import {resizeMapWhenContainerSized} from '@deck.gl/jupyter-widget/playground/utils/maplibre-utils';
import {loadBasemapCSS} from '@deck.gl/jupyter-widget/playground/playground';

test('jupyter-widget: MapLibre overlay forwards layer updates', () => {
  // The overlay is not attached to a map: creating one needs a WebGL context, which other specs
  // in the shared headless page cannot share
  const overlay = forwardLayerUpdates(new MapLibreOverlay({layers: []}));
  const layers = [new ScatterplotLayer({id: 'points', data: []})];

  overlay.setProps({layers, initialViewState: {longitude: 10, latitude: 10, zoom: 5}});

  expect(overlay._props.layers, 'Layers are forwarded to the overlay').toBe(layers);
  expect(overlay._props.initialViewState, 'Other props are not forwarded').toBeUndefined();
});

// Stands in for a MapLibre map, for the same reason as above
function createMockMap(container: HTMLElement) {
  return {getContainer: () => container, resize: vi.fn(), once: vi.fn()};
}

test('jupyter-widget: MapLibre map is resized once its container is attached', async () => {
  const container = document.createElement('div');
  container.style.width = '320px';
  container.style.height = '200px';
  const map = createMockMap(container);

  // The widget view's element is attached after the map is created
  resizeMapWhenContainerSized(map);
  expect(map.resize, 'Map is not resized while the container is detached').not.toHaveBeenCalled();

  document.body.appendChild(container);
  await vi.waitFor(() => expect(map.resize).toHaveBeenCalledTimes(1));

  container.style.width = '400px';
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(map.resize, 'Later resizes are left to MapLibre').toHaveBeenCalledTimes(1);

  container.remove();
});

test('jupyter-widget: MapLibre map in a sized container is not resized', async () => {
  const container = document.createElement('div');
  container.style.width = '320px';
  container.style.height = '200px';
  document.body.appendChild(container);
  const map = createMockMap(container);

  resizeMapWhenContainerSized(map);
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(map.resize).not.toHaveBeenCalled();

  container.remove();
});

test('jupyter-widget: MapLibre CSS is loaded for the maplibre provider', () => {
  const mapLibreCSS = `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl.css`;
  const getLinks = (url: string) => document.querySelectorAll(`link[href="${url}"]`);

  loadBasemapCSS(null);
  expect(getLinks(mapLibreCSS).length, 'Not loaded for other providers').toBe(0);

  loadBasemapCSS('maplibre');
  loadBasemapCSS('maplibre');
  expect(getLinks(mapLibreCSS).length, 'Loaded once').toBe(1);

  for (const link of document.querySelectorAll('link[href*="-gl.css"]')) {
    link.remove();
  }
});
