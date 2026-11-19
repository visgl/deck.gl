import {OrthographicView} from '@deck.gl/core';
import type {MapboxOverlay} from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';

import {DeckGL} from '../mapbox';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

// An inline style with no Mapbox-hosted sources, so the map loads without an access token.
const STYLE = {
  layers: [{id: 'land', type: 'background'}],
  sources: {},
  version: 8
} as const;

function waitForMapLoad(map: mapboxgl.Map): Promise<void> {
  if (map.loaded()) {
    return Promise.resolve();
  }
  return new Promise(resolve => map.once('load', () => resolve()));
}

function getViewportIds(overlay: MapboxOverlay | null): string[] | undefined {
  return (
    overlay as unknown as {
      _deck?: {getViewports: () => {id: string}[]};
    } | null
  )?._deck
    ?.getViewports()
    .map(viewport => viewport.id);
}

for (const interleaved of [false, true]) {
  webglTest(
    `Mapbox provider root renders a JSX view beside the map view (interleaved: ${interleaved})`,
    async () => {
      const container = document.createElement('div');
      Object.assign(container.style, {height: '300px', width: '400px'});
      Object.defineProperties(container, {
        clientHeight: {value: 300},
        clientWidth: {value: 400}
      });
      document.body.append(container);

      const map = new mapboxgl.Map({
        attributionControl: false,
        center: [-122.45, 37.78],
        container,
        style: STYLE as unknown as mapboxgl.StyleSpecification,
        testMode: true,
        zoom: 14
      });
      await waitForMapLoad(map);

      const reactHost = document.createElement('div');
      document.body.append(reactHost);
      const reactRoot = createRoot(reactHost);
      let overlay: MapboxOverlay | null = null;
      const onDeckChange = (deckgl: MapboxOverlay | null) => {
        if (deckgl && deckgl !== overlay) {
          overlay = deckgl;
          map.addControl(deckgl);
        }
      };
      const inset = new OrthographicView({
        id: 'inset',
        x: '75%',
        width: '25%',
        height: '25%'
      });

      try {
        await act(async () => {
          reactRoot.render(
            <DeckGL interleaved={interleaved} onDeckChange={onDeckChange}>
              <deckView view={inset} />
            </DeckGL>
          );
        });
        map.triggerRepaint();

        // The overlay adds its map view, `mapbox`, ahead of the JSX view.
        await vi.waitFor(() => expect(getViewportIds(overlay)).toEqual(['mapbox', 'inset']), {
          timeout: 10_000
        });

        await act(async () => {
          reactRoot.render(<DeckGL interleaved={interleaved} onDeckChange={onDeckChange} />);
        });
        map.triggerRepaint();
        await vi.waitFor(() => expect(getViewportIds(overlay)).toEqual(['mapbox']), {
          timeout: 10_000
        });
      } finally {
        reactRoot.unmount();
        map.remove();
        reactHost.remove();
        container.remove();
      }
    },
    45_000
  );
}
