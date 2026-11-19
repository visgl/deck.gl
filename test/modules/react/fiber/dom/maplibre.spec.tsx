import {OrthographicView} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import type {MapLibreOverlay} from '@deck.gl/maplibre';
import {Map as MapLibreMap} from 'maplibre-gl';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {expect, test, vi} from 'vitest';

import {DeckGL} from '../maplibre';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

function waitForMapLoad(map: MapLibreMap): Promise<void> {
  if (map.loaded()) {
    return Promise.resolve();
  }
  return new Promise(resolve => map.once('load', () => resolve()));
}

function getDeck(overlay: MapLibreOverlay) {
  return (
    overlay as unknown as {
      _deck?: {isInitialized: boolean; props: {layers: unknown[]; viewState: {zoom: number}}};
    }
  )._deck;
}

webglTest(
  'MapLibre v6 provider root attaches, orders, and cleans up an interleaved control',
  async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {height: '300px', width: '400px'});
    Object.defineProperties(container, {
      clientHeight: {value: 300},
      clientWidth: {value: 400}
    });
    document.body.append(container);

    const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
    const onDeckChange = vi.fn();
    const reactRoot = createRoot(container);
    let overlay: MapLibreOverlay | null = null;
    const layer = new BitmapLayer({
      beforeId: 'labels',
      bounds: [-122.46, 37.77, -122.44, 37.79],
      id: 'points',
      image,
      pickable: true
    });

    try {
      await act(async () => {
        reactRoot.render(
          <DeckGL
            interleaved
            onDeckChange={deckgl => {
              overlay = deckgl;
              onDeckChange(deckgl);
            }}
          >
            <deckLayer layer={layer} />
          </DeckGL>
        );
      });

      if (!overlay) {
        throw new Error('Expected the provider root to create a MapLibreOverlay');
      }
      const mapOverlay = overlay;
      expect(container.childElementCount).toBe(0);

      const map = new MapLibreMap({
        attributionControl: false,
        canvasContextAttributes: {antialias: true},
        center: [-122.45, 37.78],
        container,
        pixelRatio: window.devicePixelRatio,
        style: {layers: [{id: 'labels', type: 'background'}], sources: {}, version: 8},
        zoom: 14
      });
      await waitForMapLoad(map);

      map.addControl(overlay);
      map.triggerRepaint();

      await vi.waitFor(
        () => {
          expect(map.getLayersOrder()).toEqual([
            'deck-maplibre-layer-group-before:labels',
            'labels'
          ]);
          expect(getDeck(mapOverlay)?.isInitialized).toBe(true);
        },
        {timeout: 10_000}
      );
      expect(mapOverlay.getCanvas()).toBe(map.getCanvas());
      await vi.waitFor(() => expect(mapOverlay.pickObject({x: 200, y: 150}).picked).toBe(true), {
        timeout: 10_000
      });

      map.jumpTo({center: [-122.4, 37.8], zoom: 12});
      map.triggerRepaint();
      await vi.waitFor(() => expect(getDeck(mapOverlay)?.props.viewState.zoom).toBe(12));

      const updatedLayer = new BitmapLayer({
        beforeId: 'labels',
        bounds: [-122.46, 37.77, -122.44, 37.79],
        id: 'updated-points',
        image,
        pickable: true
      });
      await act(async () => {
        reactRoot.render(
          <DeckGL interleaved onDeckChange={onDeckChange}>
            <deckLayer layer={updatedLayer} />
          </DeckGL>
        );
      });
      await vi.waitFor(() => {
        expect(getDeck(mapOverlay)?.props.layers).toContain(updatedLayer);
      });

      map.removeControl(mapOverlay);
      expect(mapOverlay.getCanvas()).toBeNull();
      map.remove();

      await act(async () => reactRoot.unmount());
      expect(onDeckChange).toHaveBeenLastCalledWith(null);
    } finally {
      reactRoot.unmount();
      container.remove();
    }
  },
  45_000
);

webglTest(
  'MapLibre v6 provider root recreates its control when interleaved changes',
  async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {height: '300px', width: '400px'});
    Object.defineProperties(container, {
      clientHeight: {value: 300},
      clientWidth: {value: 400}
    });
    document.body.append(container);

    const map = new MapLibreMap({
      attributionControl: false,
      canvasContextAttributes: {antialias: true},
      center: [-122.45, 37.78],
      container,
      pixelRatio: window.devicePixelRatio,
      style: {layers: [{id: 'labels', type: 'background'}], sources: {}, version: 8},
      zoom: 14
    });
    await waitForMapLoad(map);

    const reactHost = document.createElement('div');
    document.body.append(reactHost);
    const reactRoot = createRoot(reactHost);
    const overlays: MapLibreOverlay[] = [];
    // `finalize` detaches a replaced overlay, so the app only attaches each new one.
    const onDeckChange = (deckgl: MapLibreOverlay | null) => {
      if (deckgl && !overlays.includes(deckgl)) {
        overlays.push(deckgl);
        map.addControl(deckgl);
      }
    };
    const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
    const layer = new BitmapLayer({
      beforeId: 'labels',
      bounds: [-122.46, 37.77, -122.44, 37.79],
      id: 'points',
      image,
      pickable: true
    });
    const renderDeckGL = (interleaved: boolean) =>
      act(async () => {
        reactRoot.render(
          <DeckGL interleaved={interleaved} onDeckChange={onDeckChange}>
            <deckLayer layer={layer} />
          </DeckGL>
        );
      });

    try {
      await renderDeckGL(false);
      const [overlaidControl] = overlays;
      expect(overlaidControl.getCanvas()).not.toBe(map.getCanvas());

      await renderDeckGL(true);
      expect(overlays).toHaveLength(2);
      const interleavedControl = overlays[1];
      expect(overlaidControl.getCanvas()).toBeNull();

      map.triggerRepaint();
      await vi.waitFor(
        () => {
          expect(map.getLayersOrder()).toEqual([
            'deck-maplibre-layer-group-before:labels',
            'labels'
          ]);
          expect(getDeck(interleavedControl)?.isInitialized).toBe(true);
        },
        {timeout: 10_000}
      );
      expect(interleavedControl.getCanvas()).toBe(map.getCanvas());
      expect(getDeck(interleavedControl)?.props.layers).toContain(layer);
      await vi.waitFor(
        () => expect(interleavedControl.pickObject({x: 200, y: 150}).picked).toBe(true),
        {timeout: 10_000}
      );

      expect(() => map.removeControl(overlaidControl)).not.toThrow();
    } finally {
      await act(async () => reactRoot.unmount());
      map.remove();
      reactHost.remove();
      container.remove();
    }
  },
  45_000
);

for (const interleaved of [false, true]) {
  webglTest(
    `MapLibre v6 provider root renders a JSX view beside the map view (interleaved: ${interleaved})`,
    async () => {
      const container = document.createElement('div');
      Object.assign(container.style, {height: '300px', width: '400px'});
      Object.defineProperties(container, {
        clientHeight: {value: 300},
        clientWidth: {value: 400}
      });
      document.body.append(container);

      const map = new MapLibreMap({
        attributionControl: false,
        center: [-122.45, 37.78],
        container,
        style: {layers: [{id: 'labels', type: 'background'}], sources: {}, version: 8},
        zoom: 14
      });
      await waitForMapLoad(map);

      const reactHost = document.createElement('div');
      document.body.append(reactHost);
      const reactRoot = createRoot(reactHost);
      let overlay: MapLibreOverlay | null = null;
      const onDeckChange = (deckgl: MapLibreOverlay | null) => {
        if (deckgl && deckgl !== overlay) {
          overlay = deckgl;
          map.addControl(deckgl);
        }
      };
      const inset = new OrthographicView({id: 'inset', x: '75%', width: '25%', height: '25%'});
      const viewportIds = () =>
        (overlay as unknown as {_deck?: {getViewports: () => {id: string}[]}})._deck
          ?.getViewports()
          .map(viewport => viewport.id);

      try {
        await act(async () => {
          reactRoot.render(
            <DeckGL interleaved={interleaved} onDeckChange={onDeckChange}>
              <deckView view={inset} />
            </DeckGL>
          );
        });
        map.triggerRepaint();

        // The overlay adds its map view, `maplibre`, ahead of the JSX view.
        await vi.waitFor(() => expect(viewportIds()).toEqual(['maplibre', 'inset']), {
          timeout: 10_000
        });

        await act(async () => {
          reactRoot.render(<DeckGL interleaved={interleaved} onDeckChange={onDeckChange} />);
        });
        map.triggerRepaint();
        await vi.waitFor(() => expect(viewportIds()).toEqual(['maplibre']), {timeout: 10_000});
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
