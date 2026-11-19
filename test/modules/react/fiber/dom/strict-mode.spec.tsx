import {type Deck, LightingEffect, MapView} from '@deck.gl/core';
import type {MapboxOverlay} from '@deck.gl/mapbox';
import type {MapLibreOverlay} from '@deck.gl/maplibre';
import {ZoomWidget} from '@deck.gl/widgets';
import mapboxgl from 'mapbox-gl';
import {Map as MapLibreMap} from 'maplibre-gl';
import {act, StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';

import {DeckGL} from '../index';
import {DeckGL as MapboxDeckGL} from '../mapbox';
import {DeckGL as MapLibreDeckGL} from '../maplibre';
import {ScatterplotLayer} from '../../wrappers/layers';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

const INITIAL_VIEW_STATE = {latitude: 37.78, longitude: -122.45, zoom: 12};
const STYLE = {layers: [{id: 'land', type: 'background'}], sources: {}, version: 8} as const;

let consoleError: ReturnType<typeof vi.spyOn>;
let consoleWarn: ReturnType<typeof vi.spyOn>;

// Tells React this test drives updates with `act`, so it does not warn about it.
(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

// Messages from the test page, unrelated to StrictMode: a worker that a dependency starts fails
// to load from the test server, and Mapbox GL warns that the page has no mapbox-gl.css.
const ENVIRONMENT_MESSAGES = ['Worker failed to load', 'missing CSS declarations for Mapbox GL JS'];

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
  consoleWarn = vi.spyOn(console, 'warn');
});

afterEach(() => {
  consoleError.mockRestore();
  consoleWarn.mockRestore();
});

/** Fails on any React or deck.gl error or warning logged during the test. */
function expectNoConsoleProblems(): void {
  const format = (calls: unknown[][]) =>
    calls
      .map(args => args.map(String).join(' ').slice(0, 200))
      .filter(message => !ENVIRONMENT_MESSAGES.some(known => message.includes(known)));
  expect(format(consoleError.mock.calls)).toEqual([]);
  expect(format(consoleWarn.mock.calls)).toEqual([]);
}

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  Object.defineProperties(container, {clientHeight: {value: 300}, clientWidth: {value: 400}});
  document.body.append(container);
  return container;
}

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 240 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

function isFinalized(deck: Deck): boolean {
  return (deck as unknown as {layerManager: unknown}).layerManager === null;
}

/** Returns the distinct non-null instances that `onDeckChange` reported, in order. */
function distinctInstances<T>(reported: (T | null)[]): T[] {
  return [...new Set(reported.filter((instance): instance is T => Boolean(instance)))];
}

/**
 * Unmounts a React root once. Tests call it in `finally` as well, so a failed assertion
 * still tears down the root before its map and containers are removed.
 */
function createUnmount(reactRoot: {unmount: () => void}): () => Promise<void> {
  let unmounted = false;
  return async () => {
    if (!unmounted) {
      unmounted = true;
      await act(async () => reactRoot.unmount());
    }
  };
}

webglTest(
  'StrictMode: a standalone root ends with one live Deck holding every element',
  async () => {
    const container = createContainer();
    const reactRoot = createRoot(container);
    const unmount = createUnmount(reactRoot);
    const decks: (Deck | null)[] = [];
    const effect = new LightingEffect();

    const app = (radius: number) => (
      <StrictMode>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          onDeckChange={instance => decks.push(instance as Deck | null)}
        >
          <deckView view={new MapView({id: 'main'})} />

          <ScatterplotLayer
            id="a"
            data={[[-122.45, 37.78]]}
            getPosition={d => d}
            getRadius={radius}
          />
          <ScatterplotLayer
            id="b"
            data={[[-122.44, 37.77]]}
            getPosition={d => d}
            getRadius={radius}
          />
          <deckWidget widget={new ZoomWidget({id: 'zoom'})} />
          <deckEffect effect={effect} />
        </DeckGL>
      </StrictMode>
    );

    try {
      await act(async () => reactRoot.render(app(100)));
      const live = decks[decks.length - 1];
      if (!live) {
        throw new Error('Expected a live Deck');
      }
      await waitFor(() => live.isInitialized);

      // StrictMode replays the mount, so it creates at least two Decks. Every Deck but the
      // last is finalized, and exactly one is live.
      const created = distinctInstances(decks);
      expect(created.length).toBeGreaterThanOrEqual(2);
      expect(created[created.length - 1]).toBe(live);
      for (const deck of created.slice(0, -1)) {
        expect(isFinalized(deck)).toBe(true);
      }
      expect(created.filter(deck => !isFinalized(deck))).toEqual([live]);
      expect(container.querySelectorAll('canvas')).toHaveLength(1);

      expect(live.getViewports().map(viewport => viewport.id)).toEqual(['main']);
      expect((live.props.layers as {id: string}[]).map(layer => layer.id)).toEqual(['a', 'b']);
      expect((live.props.widgets ?? []).map(widget => widget.id)).toEqual(['zoom']);
      expect(live.props.effects).toEqual([effect]);

      // An update reaches the same Deck.
      await act(async () => reactRoot.render(app(200)));
      await waitFor(
        () => (live.props.layers as {props: {getRadius: number}}[])[0]?.props.getRadius === 200
      );
      expect(decks[decks.length - 1]).toBe(live);

      await unmount();
      expect(decks[decks.length - 1]).toBeNull();
      expect(isFinalized(live)).toBe(true);
      expectNoConsoleProblems();
    } finally {
      await unmount();
      container.remove();
    }
  }
);

type Overlay = MapLibreOverlay | MapboxOverlay;

/** Attaches the overlay that `onDeckChange` reports, the way the map guides do. */
function useAttachedControl(map: {
  addControl: (c: never) => unknown;
  removeControl: (c: never) => unknown;
}) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  useEffect(() => {
    if (!overlay) {
      return undefined;
    }
    map.addControl(overlay as never);
    return () => {
      map.removeControl(overlay as never);
    };
  }, [map, overlay]);
  return setOverlay;
}

for (const interleaved of [false, true]) {
  webglTest(
    `StrictMode: a /maplibre root attaches one live overlay (interleaved: ${interleaved})`,
    async () => {
      const container = createContainer();
      const map = new MapLibreMap({
        attributionControl: false,
        center: [-122.45, 37.78],
        container,
        style: STYLE,
        zoom: 12
      });
      await new Promise<void>(resolve =>
        map.loaded() ? resolve() : map.once('load', () => resolve())
      );

      const reactHost = document.createElement('div');
      document.body.append(reactHost);
      const reactRoot = createRoot(reactHost);
      const unmount = createUnmount(reactRoot);
      const overlays: (Overlay | null)[] = [];

      function App() {
        const setOverlay = useAttachedControl(map);
        return (
          <MapLibreDeckGL
            interleaved={interleaved}
            onDeckChange={instance => {
              overlays.push(instance);
              setOverlay(instance);
            }}
          >
            <ScatterplotLayer data={[[-122.45, 37.78]]} getPosition={d => d} getRadius={100} />
          </MapLibreDeckGL>
        );
      }

      try {
        await act(async () =>
          reactRoot.render(
            <StrictMode>
              <App />
            </StrictMode>
          )
        );
        const live = overlays[overlays.length - 1] as MapLibreOverlay | null;
        if (!live) {
          throw new Error('Expected a live overlay');
        }
        map.triggerRepaint();
        await waitFor(() => Boolean((live as unknown as {_deck?: Deck})._deck?.isInitialized));

        // StrictMode replays the mount, so it creates at least two overlays. Only the last
        // one is attached to the map.
        const created = distinctInstances(overlays);
        expect(created.length).toBeGreaterThanOrEqual(2);
        expect(created[created.length - 1]).toBe(live);
        const controls = (map as unknown as {_controls: unknown[]})._controls;
        expect(created.filter(overlay => controls.includes(overlay))).toEqual([live]);

        await unmount();
        expect(controls.includes(live)).toBe(false);
        expectNoConsoleProblems();
      } finally {
        await unmount();
        map.remove();
        reactHost.remove();
        container.remove();
      }
    },
    45_000
  );
}

webglTest(
  'StrictMode: a /mapbox root attaches one live overlay',
  async () => {
    const container = createContainer();
    const map = new mapboxgl.Map({
      attributionControl: false,
      center: [-122.45, 37.78],
      container,
      style: STYLE as unknown as mapboxgl.StyleSpecification,
      testMode: true,
      zoom: 12
    });
    await new Promise<void>(resolve =>
      map.loaded() ? resolve() : map.once('load', () => resolve())
    );

    const reactHost = document.createElement('div');
    document.body.append(reactHost);
    const reactRoot = createRoot(reactHost);
    const unmount = createUnmount(reactRoot);
    const overlays: (Overlay | null)[] = [];

    function App() {
      const setOverlay = useAttachedControl(map);
      return (
        <MapboxDeckGL
          onDeckChange={instance => {
            overlays.push(instance);
            setOverlay(instance);
          }}
        >
          <ScatterplotLayer data={[[-122.45, 37.78]]} getPosition={d => d} getRadius={100} />
        </MapboxDeckGL>
      );
    }

    try {
      await act(async () =>
        reactRoot.render(
          <StrictMode>
            <App />
          </StrictMode>
        )
      );
      const live = overlays[overlays.length - 1];
      if (!live) {
        throw new Error('Expected a live overlay');
      }
      map.triggerRepaint();
      await waitFor(() => Boolean((live as unknown as {_deck?: Deck})._deck?.isInitialized));

      // StrictMode replays the mount, so it creates at least two overlays. Only the last one is
      // attached to the map.
      const created = distinctInstances(overlays);
      expect(created.length).toBeGreaterThanOrEqual(2);
      expect(created[created.length - 1]).toBe(live);
      const controls = (map as unknown as {_controls: unknown[]})._controls;
      expect(created.filter(overlay => controls.includes(overlay))).toEqual([live]);

      await unmount();
      expect(controls.includes(live)).toBe(false);
      expectNoConsoleProblems();
    } finally {
      await unmount();
      map.remove();
      reactHost.remove();
      container.remove();
    }
  },
  45_000
);
