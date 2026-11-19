// The `map` prop attaches the overlay as soon as the root creates it, which is usually before the
// map's style has loaded. These tests check that deck.gl still renders in that case.
import {BitmapLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import {Map as MapLibreMap} from 'maplibre-gl';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';

import {DeckGL as MapboxDeckGL} from '../mapbox';
import {DeckGL as MapLibreDeckGL} from '../maplibre';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

// An inline style with no hosted sources, so neither map needs a network or an access token.
const STYLE = {layers: [{id: 'land', type: 'background'}], sources: {}, version: 8} as const;

type AnyMap = MapLibreMap | mapboxgl.Map;
type Overlay = {pickObject(opts: {x: number; y: number}): {picked?: boolean} | null};

const PROVIDERS = [
  {
    name: 'MapLibre',
    Root: MapLibreDeckGL as typeof MapboxDeckGL,
    createMap: (container: HTMLElement): AnyMap =>
      new MapLibreMap({
        attributionControl: false,
        canvasContextAttributes: {antialias: true},
        center: [-122.45, 37.78],
        container,
        style: STYLE as never,
        zoom: 14
      })
  },
  {
    name: 'Mapbox',
    Root: MapboxDeckGL,
    createMap: (container: HTMLElement): AnyMap =>
      new mapboxgl.Map({
        attributionControl: false,
        center: [-122.45, 37.78],
        container,
        style: STYLE as never,
        testMode: true,
        zoom: 14
      })
  }
];

for (const {name, Root, createMap} of PROVIDERS) {
  for (const interleaved of [false, true]) {
    webglTest(
      `${name} map prop attaches before the style loads and renders (interleaved: ${interleaved})`,
      async () => {
        const container = document.createElement('div');
        Object.assign(container.style, {height: '300px', width: '400px'});
        Object.defineProperties(container, {clientHeight: {value: 300}, clientWidth: {value: 400}});
        document.body.append(container);
        const reactHost = document.createElement('div');
        document.body.append(reactHost);
        const reactRoot = createRoot(reactHost);

        const map = createMap(container);
        const styleLoadedAtAttach: boolean[] = [];
        const addControl = map.addControl.bind(map) as (control: unknown) => unknown;
        (map as {addControl: (control: unknown) => unknown}).addControl = control => {
          styleLoadedAtAttach.push(map.isStyleLoaded() === true);
          return addControl(control);
        };

        let overlay: Overlay | null = null;
        const layer = new BitmapLayer({
          bounds: [-122.46, 37.77, -122.44, 37.79],
          id: 'image',
          // Built in the test: jsdom, which loads this file too, has no ImageData.
          image: new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1),
          pickable: true
        });

        try {
          await act(async () => {
            reactRoot.render(
              <Root
                interleaved={interleaved}
                map={map as never}
                onDeckChange={deckgl => {
                  overlay = deckgl as unknown as Overlay | null;
                }}
              >
                <deckLayer layer={layer} />
              </Root>
            );
          });

          // The root attached the overlay itself, before the style finished loading.
          expect(styleLoadedAtAttach).toEqual([false]);
          expect(map.hasControl(overlay as never)).toBe(true);

          map.triggerRepaint();
          await vi.waitFor(
            () => {
              map.triggerRepaint();
              expect(overlay?.pickObject({x: 200, y: 150})?.picked).toBe(true);
            },
            {interval: 100, timeout: 15_000}
          );

          // onDeckChange sets `overlay` to null during unmount, so keep the attached instance.
          const attachedOverlay = overlay;
          await act(async () => reactRoot.unmount());
          expect(map.hasControl(attachedOverlay as never)).toBe(false);
        } finally {
          reactRoot.unmount();
          map.remove();
          container.remove();
          reactHost.remove();
        }
      },
      45_000
    );
  }
}
