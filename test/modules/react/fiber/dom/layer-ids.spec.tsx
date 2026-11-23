// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Deck, type Layer, log, type UpdateParameters} from '@deck.gl/core';
import {MapView} from '@deck.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import {ScatterplotLayer} from '@deck.gl/layers';
import {act, type ReactNode, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach, expect, test, vi} from 'vitest';

import {DeckGL} from '@deck.gl/react/dom/index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

type Point = [number, number];

/** Counts how often deck.gl initializes, finalizes and recomputes layers of this class. */
const lifecycle = {dataUpdates: 0, finalized: 0, initialized: 0};

class CountingLayer extends ScatterplotLayer<Point> {
  static layerName = 'CountingLayer';

  initializeState() {
    lifecycle.initialized++;
    super.initializeState();
  }

  updateState(params: UpdateParameters<this>) {
    if (params.changeFlags.dataChanged) {
      lifecycle.dataUpdates++;
    }
    super.updateState(params);
  }

  finalizeState(context: Parameters<ScatterplotLayer<Point>['finalizeState']>[0]) {
    lifecycle.finalized++;
    super.finalizeState(context);
  }
}

const POINTS: Point[] = [[0, 0]];

/** A layer with no `id`, so deck.gl's default would be its class's `layerName`. */
function createLayer(radius: number, data: Point[] = POINTS) {
  return new CountingLayer({data, getPosition: d => d, getRadius: radius});
}

function Points({radius}: {radius: number}) {
  return <deckLayer layer={createLayer(radius)} />;
}

/** Renders a lone unkeyed `<deckLayer>`, as the built-in layer components do. */
function LayerElement({layer}: {layer: Layer}) {
  return <deckLayer layer={layer} />;
}

/** Renders a layer under the same key as every other `KeyedPoints`. */
function KeyedPoints({radius}: {radius: number}) {
  return [<deckLayer key="points" layer={createLayer(radius)} />];
}

/** Ways to render two layers that have no `id`, and the ids the renderer gives them. */
const LAYOUTS: Record<string, [(radius: number) => ReactNode, string[]]> = {
  'two <deckLayer> siblings': [
    radius => (
      <>
        <deckLayer layer={createLayer(radius)} />
        <deckLayer layer={createLayer(radius)} />
      </>
    ),
    ['CountingLayer/#0', 'CountingLayer/#1']
  ],
  'keyed <deckLayer> elements from an array': [
    radius => ['a', 'b'].map(key => <deckLayer key={key} layer={createLayer(radius)} />),
    ['CountingLayer/a', 'CountingLayer/b']
  ],
  'keyed components that render a lone <deckLayer>': [
    radius => ['a', 'b'].map(key => <LayerElement key={key} layer={createLayer(radius)} />),
    ['CountingLayer/a', 'CountingLayer/b']
  ],
  'a keyed component per layer': [
    radius => (
      <>
        <Points key="a" radius={radius} />
        <Points key="b" radius={radius} />
      </>
    ),
    ['CountingLayer/a', 'CountingLayer/b']
  ],
  'unkeyed components': [
    radius => (
      <>
        <Points radius={radius} />
        <Points radius={radius} />
      </>
    ),
    ['CountingLayer/#0', 'CountingLayer/#1']
  ],
  'components that use the same key': [
    radius => (
      <>
        <KeyedPoints key="a" radius={radius} />
        <KeyedPoints key="b" radius={radius} />
      </>
    ),
    ['CountingLayer/a/points', 'CountingLayer/b/points']
  ],
  'a <deckView> parent': [
    radius => (
      <deckView view={new MapView({id: 'main'})}>
        <deckLayer layer={createLayer(radius)} />
        <Points key="a" radius={radius} />
      </deckView>
    ),
    ['CountingLayer/#0/#0', 'CountingLayer/#0/a']
  ]
};

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

/** The layers deck.gl has matched, in draw order. They can lag `deck.props.layers` by a frame. */
function getLayers(deck: Deck | null): Layer[] {
  const layerManager = (deck as unknown as {layerManager?: {getLayers(): Layer[]}} | null)
    ?.layerManager;
  return layerManager?.getLayers() ?? [];
}

function getLayerIds(deck: Deck | null): string[] {
  return getLayers(deck).map(layer => layer.id);
}

function getRadius(layer: Layer | undefined): unknown {
  return (layer?.props as unknown as {getRadius?: unknown} | undefined)?.getRadius;
}

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  return container;
}

/** Mounts a `DeckGL` root and renders `children` into it on each call. */
function mountDeck() {
  const container = createContainer();
  const reactRoot = createRoot(container);
  const state = {deck: null as Deck | null};
  return {
    get deck() {
      return state.deck;
    },
    render: (children: ReactNode) =>
      act(async () =>
        reactRoot.render(
          <DeckGL
            initialViewState={{latitude: 0, longitude: 0, zoom: 1}}
            onDeckChange={instance => {
              state.deck = instance as Deck | null;
            }}
          >
            {children}
          </DeckGL>
        )
      ),
    unmount: () => {
      act(() => reactRoot.unmount());
      container.remove();
    }
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  lifecycle.dataUpdates = 0;
  lifecycle.finalized = 0;
  lifecycle.initialized = 0;
});

webglTest.each(Object.keys(LAYOUTS))(
  'a layer without an id gets one from its position in the React tree: %s',
  async layout => {
    const [renderLayers, expectedIds] = LAYOUTS[layout];
    const warnSpy = vi.spyOn(log, 'warn');
    const root = mountDeck();

    try {
      await root.render(renderLayers(1e5));
      await waitFor(() => getLayerIds(root.deck).length === 2);
      expect(getLayerIds(root.deck)).toEqual(expectedIds);

      for (const radius of [2e5, 3e5, 4e5]) {
        await root.render(renderLayers(radius));
        await waitFor(() => getLayers(root.deck).every(layer => getRadius(layer) === radius));
      }

      // deck.gl matches both layers on every update, so it initializes each one only once.
      expect(getLayerIds(root.deck)).toEqual(expectedIds);
      expect(lifecycle).toMatchObject({finalized: 0, initialized: 2});
      expect(warnSpy.mock.calls.some(([message]) => String(message).includes('same id'))).toBe(
        false
      );
    } finally {
      root.unmount();
    }
  }
);

webglTest('a layer with an id, or a lone layer, keeps its id', async () => {
  const root = mountDeck();

  try {
    await root.render(
      <>
        <deckLayer key="a" layer={new CountingLayer({data: [], id: 'points'})} />
        <deckLayer key="b" layer={new CountingLayer({data: [], id: 'more-points'})} />
      </>
    );
    await waitFor(() => getLayerIds(root.deck).length === 2);
    expect(getLayerIds(root.deck)).toEqual(['points', 'more-points']);

    // A lone top-level layer keeps deck.gl's default id, as it would without React.
    await root.render(<deckLayer layer={createLayer(1e5)} />);
    await waitFor(() => getLayerIds(root.deck).length === 1);
    expect(getLayerIds(root.deck)).toEqual(['CountingLayer']);
  } finally {
    root.unmount();
  }
});

webglTest('a memoized layer without an id is passed to deck.gl as the same layer', async () => {
  const root = mountDeck();

  function Memoized() {
    return <deckLayer layer={useMemo(() => createLayer(1e5), [])} />;
  }

  try {
    await root.render(
      <>
        <Memoized />
        <deckLayer layer={createLayer(1e5)} />
      </>
    );
    await waitFor(() => getLayerIds(root.deck).length === 2);
    const [memoized] = root.deck!.props.layers as Layer[];
    expect(memoized.id).toBe('CountingLayer/#0');

    await root.render(
      <>
        <Memoized />
        <deckLayer layer={createLayer(2e5)} />
      </>
    );
    await waitFor(() => getRadius(getLayers(root.deck)[1]) === 2e5);
    // The clone that carries the id is made once, so deck.gl sees no new layer to diff.
    expect((root.deck!.props.layers as Layer[])[0]).toBe(memoized);
  } finally {
    root.unmount();
  }
});

/** Renders `keys` as layers, keyed or not, each with its own data and its key as its radius. */
function renderList(keys: string[], keyed: boolean, data: Record<string, Point[]>) {
  return keys.map(key => (
    <deckLayer
      key={keyed ? key : undefined}
      layer={new CountingLayer({data: data[key], getPosition: d => d, getRadius: Number(key)})}
    />
  ));
}

/** Waits until deck.gl draws one layer per key, in order. */
async function waitForList(deck: () => Deck | null, keys: string[]): Promise<void> {
  await waitFor(() => getLayers(deck()).map(getRadius).join() === keys.map(Number).join());
}

webglTest(
  'reordering keyed layers keeps their ids and their state, and the draw order follows',
  async () => {
    const data = {1: [[0, 0]], 2: [[1, 1]], 3: [[2, 2]]} as Record<string, Point[]>;
    const root = mountDeck();

    try {
      await root.render(renderList(['1', '2', '3'], true, data));
      await waitForList(() => root.deck, ['1', '2', '3']);
      expect(getLayerIds(root.deck)).toEqual([
        'CountingLayer/1',
        'CountingLayer/2',
        'CountingLayer/3'
      ]);

      await root.render(renderList(['3', '1', '2'], true, data));
      await waitForList(() => root.deck, ['3', '1', '2']);
      expect(getLayerIds(root.deck)).toEqual([
        'CountingLayer/3',
        'CountingLayer/1',
        'CountingLayer/2'
      ]);
      // Each layer was matched with itself: no new state, and no data to recompute.
      expect(lifecycle).toEqual({dataUpdates: 3, finalized: 0, initialized: 3});
    } finally {
      root.unmount();
    }
  }
);

webglTest('inserting, removing or reordering unkeyed layers moves their ids', async () => {
  // React reports the missing keys, which is the point of this test.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const data = {1: [[0, 0]], 2: [[1, 1]], 3: [[2, 2]], 4: [[3, 3]]} as Record<string, Point[]>;
  const root = mountDeck();

  try {
    await root.render(renderList(['1', '2', '3'], false, data));
    await waitForList(() => root.deck, ['1', '2', '3']);
    expect(lifecycle).toEqual({dataUpdates: 3, finalized: 0, initialized: 3});

    // Inserting at the front shifts every index: each layer is matched with the state of the
    // one that was at its index, so it recomputes its data, and the last one is new.
    await root.render(renderList(['4', '1', '2', '3'], false, data));
    await waitForList(() => root.deck, ['4', '1', '2', '3']);
    expect(getLayerIds(root.deck)).toEqual([
      'CountingLayer/#0',
      'CountingLayer/#1',
      'CountingLayer/#2',
      'CountingLayer/#3'
    ]);
    expect(lifecycle).toEqual({dataUpdates: 3 + 4, finalized: 0, initialized: 4});

    // Removing the first one shifts them back, and the last state is finalized.
    await root.render(renderList(['1', '2', '3'], false, data));
    await waitForList(() => root.deck, ['1', '2', '3']);
    expect(lifecycle).toEqual({dataUpdates: 7 + 3, finalized: 1, initialized: 4});

    // Reordering keeps the ids at their indexes, so every layer takes another's state.
    await root.render(renderList(['3', '1', '2'], false, data));
    await waitForList(() => root.deck, ['3', '1', '2']);
    expect(lifecycle).toEqual({dataUpdates: 10 + 3, finalized: 1, initialized: 4});
  } finally {
    root.unmount();
  }
});

webglTest('a conditional layer keeps the ids of its unkeyed siblings', async () => {
  const root = mountDeck();
  const render = (show: boolean) =>
    root.render(
      <>
        {show && <deckLayer layer={createLayer(1)} />}
        <deckLayer layer={createLayer(2)} />
      </>
    );

  try {
    await render(false);
    await waitFor(() => getLayerIds(root.deck).length === 1);
    expect(getLayerIds(root.deck)).toEqual(['CountingLayer/#1']);

    // React keeps a slot for `show && ...`, so the sibling's index, and its id, do not move.
    await render(true);
    await waitFor(() => getLayerIds(root.deck).length === 2);
    expect(getLayerIds(root.deck)).toEqual(['CountingLayer/#0', 'CountingLayer/#1']);
    expect(lifecycle).toMatchObject({finalized: 0, initialized: 2});
  } finally {
    root.unmount();
  }
});

/** Times deck.gl's layer matching and attribute updates, which `setLayers` runs. */
function timeLayerUpdates(deck: Deck): {reset(): void; restore(): void; total(): number} {
  const layerManager = (deck as unknown as {layerManager: object}).layerManager;
  // deck.gl seals its instances, so the method is wrapped on the prototype.
  const prototype = Object.getPrototypeOf(layerManager) as {setLayers(...args: unknown[]): void};
  const setLayers = prototype.setLayers;
  let total = 0;
  const spy = vi.spyOn(prototype, 'setLayers').mockImplementation(function (
    this: unknown,
    ...args
  ) {
    const start = performance.now();
    setLayers.apply(this, args);
    total += performance.now() - start;
  });
  return {
    reset: () => {
      total = 0;
    },
    restore: () => spy.mockRestore(),
    total: () => total
  };
}

webglTest(
  'measures what moving ids costs: keyed and unkeyed insertion',
  async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const size = 50_000;
    const data = Object.fromEntries(
      ['1', '2', '3', '4'].map(key => [
        key,
        Array.from({length: size}, (_, i): Point => [(i % 360) - 180, (i % 170) - 85])
      ])
    ) as Record<string, Point[]>;
    const results: Record<string, number> = {};

    for (const keyed of [true, false]) {
      const root = mountDeck();
      try {
        await root.render(renderList(['1', '2', '3'], keyed, data));
        await waitForList(() => root.deck, ['1', '2', '3']);
        const timer = timeLayerUpdates(root.deck!);
        const samples: number[] = [];
        try {
          for (let round = 0; round < 3; round++) {
            timer.reset();
            await root.render(renderList(['4', '1', '2', '3'], keyed, data));
            await waitForList(() => root.deck, ['4', '1', '2', '3']);
            samples.push(timer.total());
            await root.render(renderList(['1', '2', '3'], keyed, data));
            await waitForList(() => root.deck, ['1', '2', '3']);
          }
        } finally {
          timer.restore();
        }
        results[keyed ? 'keyed' : 'unkeyed'] = samples.sort((a, b) => a - b)[1];
      } finally {
        root.unmount();
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `Inserting a ${size}-point layer before three others: ` +
        `keyed ${results.keyed.toFixed(1)} ms, unkeyed ${results.unkeyed.toFixed(1)} ms`
    );
    // Keyed, only the new layer computes its attributes; unkeyed, all four do.
    expect(results.unkeyed).toBeGreaterThan(results.keyed);
  },
  120_000
);

webglTest('a TileLayer whose id moves fetches its tiles again', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const fetches: Record<string, number> = {roads: 0, water: 0};
  const createTileLayer = (source: 'roads' | 'water') =>
    new TileLayer({
      data: `${source}/{z}/{x}/{y}`,
      getTileData: () => {
        fetches[source]++;
        return [];
      }
    });
  const render = (root: ReturnType<typeof mountDeck>, keyed: boolean, extra: boolean) =>
    root.render([
      ...(extra ? [<deckLayer key={keyed ? 'extra' : undefined} layer={createLayer(1)} />] : []),
      <deckLayer key={keyed ? 'roads' : undefined} layer={createTileLayer('roads')} />,
      <deckLayer key={keyed ? 'water' : undefined} layer={createTileLayer('water')} />
    ]);

  for (const keyed of [true, false]) {
    const root = mountDeck();
    fetches.roads = 0;
    fetches.water = 0;
    try {
      await render(root, keyed, false);
      await waitFor(() => fetches.roads > 0 && fetches.water > 0);
      // Let both tilesets settle before counting again.
      for (let frame = 0; frame < 10; frame++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      const before = {...fetches};

      await render(root, keyed, true);
      await waitFor(() => getLayers(root.deck).some(layer => layer instanceof CountingLayer));
      for (let frame = 0; frame < 10; frame++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      if (keyed) {
        // Each TileLayer keeps its id and its tile cache.
        expect(fetches).toEqual(before);
      } else {
        // Each TileLayer's id now names another's state: `roads` takes over `water`'s tileset and
        // reloads it for its own data, and `water` starts a new tileset.
        expect(fetches.roads).toBeGreaterThan(before.roads);
        expect(fetches.water).toBeGreaterThan(before.water);
      }
    } finally {
      root.unmount();
    }
  }
});
