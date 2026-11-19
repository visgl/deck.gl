import {type Deck, type Layer, MapView, type View} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {_SplitterWidget as SplitterWidget, ZoomWidget} from '@deck.gl/widgets';
import {act, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';

import {DeckGL} from '../index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

const INITIAL_VIEW_STATE = {
  left: {latitude: 0, longitude: 0, zoom: 1},
  right: {latitude: 0, longitude: 0, zoom: 2}
};

function createViewLayout() {
  return {
    orientation: 'horizontal' as const,
    views: [new MapView({id: 'left'}), new MapView({id: 'right'})] as [View, View]
  };
}

function createLayer(radius: number) {
  return new ScatterplotLayer<[number, number]>({
    data: [[0, 0]],
    getPosition: d => d,
    getRadius: radius,
    id: 'points'
  });
}

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  return container;
}

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

function getViewports(deck: Deck | null): {id: string; width: number}[] {
  // getViewports() asserts until deck.gl has initialized its view manager.
  return (deck?.isInitialized ? deck.getViewports() : []).map(({id, width}) => ({id, width}));
}

/** Drags the splitter handle to a fraction of the container width. */
async function dragSplitter(container: HTMLElement, split: number): Promise<void> {
  // deck.gl renders widget DOM on a redraw, which can come after the views it set are in place.
  await waitFor(() => Boolean(container.querySelector('.deck-widget-splitter-handle')));
  const handle = container.querySelector('.deck-widget-splitter-handle');
  if (!handle) {
    throw new Error('Expected a splitter handle');
  }
  const rect = container.getBoundingClientRect();
  const clientX = rect.left + rect.width * split;
  const clientY = rect.top + rect.height / 2;
  await act(async () => {
    handle.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX, clientY}));
  });
  // The splitter, a Preact component, adds its document listeners in an effect.
  for (let frame = 0; frame < 5; frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  await act(async () => {
    document.dispatchEvent(new PointerEvent('pointermove', {bubbles: true, clientX, clientY}));
    document.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, clientX, clientY}));
  });
}

webglTest('a SplitterWidget keeps the views it sets when the root renders again', async () => {
  const container = createContainer();
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;
  const splitter = new SplitterWidget({id: 'splitter', viewLayout: createViewLayout()});

  const render = (radius: number) =>
    reactRoot.render(
      <DeckGL<MapView[]>
        controller
        initialViewState={INITIAL_VIEW_STATE}
        onDeckChange={instance => {
          deck = instance as Deck | null;
        }}
      >
        <deckLayer layer={createLayer(radius)} />
        <deckWidget widget={splitter} />
      </DeckGL>
    );

  try {
    await act(async () => render(1e5));
    await waitFor(
      () =>
        getViewports(deck)
          .map(({id}) => id)
          .join() === 'left,right'
    );

    // The root has no views of its own, so a new commit must leave the widget's views alone.
    await act(async () => render(2e5));
    await waitFor(() => (deck?.props.layers as Layer[] | undefined)?.[0] !== undefined);
    expect(getViewports(deck)).toEqual([
      {id: 'left', width: 200},
      {id: 'right', width: 200}
    ]);

    await dragSplitter(container, 0.3);
    await waitFor(() => getViewports(deck)[0]?.width === 120);

    await act(async () => render(3e5));
    await waitFor(
      () => (deck?.props.layers as ScatterplotLayer[] | undefined)?.[0]?.props.getRadius === 3e5
    );
    expect(getViewports(deck)).toEqual([
      {id: 'left', width: 120},
      {id: 'right', width: 280}
    ]);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

webglTest('a SplitterWidget drives <deckView> children through onChange', async () => {
  const container = createContainer();
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;

  function App() {
    const [views, setViews] = useState<View[]>([]);
    const splitter = useMemo(
      () =>
        new SplitterWidget({id: 'splitter', onChange: setViews, viewLayout: createViewLayout()}),
      []
    );
    return (
      <DeckGL<MapView[]>
        controller
        initialViewState={INITIAL_VIEW_STATE}
        onDeckChange={instance => {
          deck = instance as Deck | null;
        }}
      >
        {views.map(view => (
          <deckView key={view.id} view={view} />
        ))}
        <deckLayer layer={createLayer(1e5)} />
        <deckWidget widget={splitter} />
      </DeckGL>
    );
  }

  try {
    await act(async () => reactRoot.render(<App />));
    await waitFor(
      () =>
        getViewports(deck)
          .map(({id}) => id)
          .join() === 'left,right'
    );

    await dragSplitter(container, 0.7);
    await waitFor(() => getViewports(deck)[0]?.width === 280);
    expect(getViewports(deck)).toEqual([
      {id: 'left', width: 280},
      {id: 'right', width: 120}
    ]);
    // The views come from React state, through the <deckView> children.
    const widths = (deck?.props.views as View[]).map(view =>
      Number.parseFloat(String(view.props.width))
    );
    expect(widths[0]).toBeCloseTo(70);
    expect(widths[1]).toBeCloseTo(30);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

webglTest('a widget with a viewId renders in its view', async () => {
  const container = createContainer();
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;

  try {
    await act(async () =>
      reactRoot.render(
        <DeckGL<MapView[]>
          controller
          initialViewState={INITIAL_VIEW_STATE}
          onDeckChange={instance => {
            deck = instance as Deck | null;
          }}
        >
          <deckView view={new MapView({id: 'left', width: '50%'})} />
          <deckView view={new MapView({id: 'right', width: '50%', x: '50%'})} />
          <deckWidget widget={new ZoomWidget({id: 'zoom-left', viewId: 'left'})} />
          <deckWidget widget={new ZoomWidget({id: 'zoom-right', viewId: 'right'})} />
        </DeckGL>
      )
    );
    await waitFor(() => getViewports(deck).length === 2);
    await waitFor(() => container.querySelectorAll('.deck-widget-zoom').length === 2);

    // deck.gl positions each view's widget container on a later redraw.
    const getZoomOffsets = () => {
      const containerLeft = container.getBoundingClientRect().left;
      return [...container.querySelectorAll('.deck-widget-zoom')].map(
        element => element.getBoundingClientRect().left - containerLeft
      );
    };
    await waitFor(() => (getZoomOffsets()[1] ?? 0) >= 200);
    const [left, right] = getZoomOffsets();
    expect(left).toBeLessThan(200);
    expect(right).toBeGreaterThanOrEqual(200);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});
