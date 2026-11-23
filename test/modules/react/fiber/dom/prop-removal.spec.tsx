// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, type MapViewState} from '@deck.gl/core';
import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {expect, test, vi} from 'vitest';

import {DeckGL} from '@deck.gl/react/dom/index';
import type {DeckGLProps} from '@deck.gl/react/types/index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

const VIEW = new MapView({id: 'map'});
const START: MapViewState = {latitude: 0, longitude: 0, zoom: 1};
const CONTROLLED: MapViewState = {latitude: 10, longitude: 20, zoom: 3};

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

/** Renders `DeckGL` into a sized container and returns the Deck it creates. */
async function mount() {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '200px', position: 'relative', width: '300px'});
  document.body.append(container);
  const reactRoot: Root = createRoot(container);
  let deck: Deck | null = null;

  const render = (props: Partial<DeckGLProps>) =>
    act(async () =>
      reactRoot.render(
        <DeckGL
          views={VIEW}
          onDeckChange={instance => {
            deck = instance as Deck | null;
          }}
          {...props}
        />
      )
    );

  return {
    get deck() {
      return deck;
    },
    render,
    unmount() {
      act(() => reactRoot.unmount());
      container.remove();
    }
  };
}

function getCenter(deck: Deck | null): [number, number] | null {
  const viewport = deck?.isInitialized ? deck.getViewports()[0] : undefined;
  return viewport ? [viewport.longitude, viewport.latitude] : null;
}

webglTest('a removed onError is no longer called', async () => {
  const test = await mount();
  try {
    const onError = vi.fn();
    await test.render({initialViewState: START, onError});
    await waitFor(() => Boolean(test.deck?.isInitialized));
    expect(test.deck!.props.onError).toBe(onError);

    await test.render({initialViewState: START});
    expect(test.deck!.props.onError).toBe(Deck.defaultProps.onError);
    // deck.gl reports errors through its current `onError` prop.
    test.deck!.props.onError?.(new Error('after removal'));
    expect(onError).not.toHaveBeenCalled();
  } finally {
    test.unmount();
  }
});

webglTest('removed parameters stop applying', async () => {
  const test = await mount();
  try {
    await test.render({
      initialViewState: START,
      parameters: {blend: false, depthWriteEnabled: false}
    });
    await waitFor(() => Boolean(test.deck?.isInitialized));
    expect(test.deck!.props.parameters).toStrictEqual({blend: false, depthWriteEnabled: false});

    await test.render({initialViewState: START});
    expect(test.deck!.props.parameters).toStrictEqual({});
  } finally {
    test.unmount();
  }
});

webglTest('viewState can switch from controlled to uncontrolled and back', async () => {
  const test = await mount();
  try {
    await test.render({initialViewState: START, viewState: CONTROLLED});
    await waitFor(() => getCenter(test.deck)?.[0] === CONTROLLED.longitude);

    // Uncontrolled: deck.gl falls back to its own view state, which is still the initial one,
    // because nothing moved the camera while it was controlled.
    await test.render({initialViewState: START});
    expect(test.deck!.props.viewState).toBeNull();
    await waitFor(() => getCenter(test.deck)?.[0] === START.longitude);

    // Controlled again: the new viewState wins.
    await test.render({initialViewState: START, viewState: CONTROLLED});
    await waitFor(() => getCenter(test.deck)?.[0] === CONTROLLED.longitude);
  } finally {
    test.unmount();
  }
});

webglTest('a prop set to undefined falls back to the deck.gl default (#10906)', async () => {
  const test = await mount();
  try {
    const onLoad = vi.fn();
    await test.render({initialViewState: START, onLoad: undefined});
    await waitFor(() => Boolean(test.deck?.isInitialized));
    // deck.gl calls `onLoad()` without checking for it, so it must hold a function.
    expect(test.deck!.props.onLoad).toBe(Deck.defaultProps.onLoad);

    await test.render({initialViewState: START, onLoad});
    expect(test.deck!.props.onLoad).toBe(onLoad);
    await test.render({initialViewState: START, onLoad: undefined});
    expect(test.deck!.props.onLoad).toBe(Deck.defaultProps.onLoad);
  } finally {
    test.unmount();
  }
});

webglTest('removing the views prop with no JSX views restores the default view', async () => {
  const test = await mount();
  try {
    await test.render({initialViewState: START});
    await waitFor(() => Boolean(test.deck?.isInitialized));
    expect(test.deck!.getViewports().map(viewport => viewport.id)).toEqual(['map']);

    await test.render({initialViewState: START, views: undefined});
    await waitFor(() => test.deck!.getViewports()[0]?.id !== 'map');
    expect(test.deck!.props.views).toBeNull();
    expect(test.deck!.getViewports()).toHaveLength(1);
  } finally {
    test.unmount();
  }
});
