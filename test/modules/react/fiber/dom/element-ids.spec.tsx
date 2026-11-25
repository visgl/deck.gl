// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Deck, type Effect, MapView, PostProcessEffect} from '@deck.gl/core';
import type {ShaderPass} from '@luma.gl/shaders';
import {ZoomWidget} from '@deck.gl/widgets';
import {act, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';

import {PostProcessEffect as PostProcessEffectComponent} from '@deck.gl/react/wrappers/core';
import {DeckGL} from '@deck.gl/react/dom/index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

function getViewports(deck: Deck | null): {id: string; zoom: number}[] {
  // getViewports() asserts until deck.gl has initialized its view manager.
  return (deck?.isInitialized ? deck.getViewports() : []).map(viewport => ({
    id: viewport.id,
    zoom: (viewport as unknown as {zoom: number}).zoom
  }));
}

function getEffects(deck: Deck | null): Effect[] {
  return (
    (deck as unknown as {effectManager?: {effects: Effect[]}} | null)?.effectManager?.effects ?? []
  );
}

/** Mounts a `DeckGL` root and renders into it with the given view state on each call. */
function mountDeck() {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  const reactRoot = createRoot(container);
  const state = {deck: null as Deck | null};
  return {
    container,
    get deck() {
      return state.deck;
    },
    render: (initialViewState: object, children: ReactNode) =>
      act(async () =>
        reactRoot.render(
          <DeckGL
            deviceProps={{type: 'webgl'}}
            initialViewState={
              initialViewState as {latitude: number; longitude: number; zoom: number}
            }
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

const LEFT = {width: '50%'};
const RIGHT = {width: '50%', x: '50%'};

webglTest(
  'views without an id get one from their keys, which view-keyed view states use',
  async () => {
    const root = mountDeck();
    const views = [
      <deckView key="left" view={new MapView(LEFT)} />,
      <deckView key="right" view={new MapView(RIGHT)} />
    ];

    try {
      // One view state for every view needs no ids.
      await root.render({latitude: 0, longitude: 0, zoom: 3}, views);
      await waitFor(() => getViewports(root.deck).length === 2);
      expect(getViewports(root.deck)).toEqual([
        {id: 'MapView/left', zoom: 3},
        {id: 'MapView/right', zoom: 3}
      ]);

      // A view state for each view is keyed by the generated ids.
      await root.render(
        {
          'MapView/left': {latitude: 0, longitude: 0, zoom: 1},
          'MapView/right': {latitude: 0, longitude: 0, zoom: 2}
        },
        views
      );
      await waitFor(() => getViewports(root.deck)[1]?.zoom === 2);
      expect(getViewports(root.deck).map(({zoom}) => zoom)).toEqual([1, 2]);
    } finally {
      root.unmount();
    }
  }
);

webglTest(
  'widgets without an id no longer replace each other, and viewId names a generated view id',
  async () => {
    const root = mountDeck();
    const getZoomOffsets = () => {
      const left = root.container.getBoundingClientRect().left;
      return [...root.container.querySelectorAll('.deck-widget-zoom')].map(
        element => element.getBoundingClientRect().left - left
      );
    };

    try {
      await root.render({latitude: 0, longitude: 0, zoom: 1}, [
        <deckView key="left" view={new MapView(LEFT)} />,
        <deckView key="right" view={new MapView(RIGHT)} />,
        // Both keep ZoomWidget's default id, 'zoom', which deck.gl would add only once.
        <deckWidget key="zoom-left" widget={new ZoomWidget({viewId: 'MapView/left'})} />,
        <deckWidget key="zoom-right" widget={new ZoomWidget({viewId: 'MapView/right'})} />
      ]);
      await waitFor(() => getZoomOffsets().length === 2);
      expect(root.deck?.props.widgets?.map(widget => widget?.id)).toEqual([
        'zoom/zoom%2Dleft',
        'zoom/zoom%2Dright'
      ]);
      // deck.gl positions each view's widget container on a later redraw.
      await waitFor(() => (getZoomOffsets()[1] ?? 0) >= 200);
      expect(getZoomOffsets()[0]).toBeLessThan(200);
    } finally {
      root.unmount();
    }
  }
);

/** A post-processing pass that leaves colors unchanged, so two instances can run together. */
const identity = {
  fs: /* glsl */ `\
vec4 identity_filterColor_ext(vec4 color, vec2 texSize, vec2 texCoord) {
  return color;
}
`,
  name: 'identity',
  passes: [{filter: true}]
} as unknown as ShaderPass;

webglTest('two effect components of one kind get distinct ids, so deck.gl keeps both', async () => {
  const root = mountDeck();

  try {
    await root.render({latitude: 0, longitude: 0, zoom: 1}, [
      <PostProcessEffectComponent key="first" module={identity} />,
      <PostProcessEffectComponent key="second" module={identity} />
    ]);
    await waitFor(() => getEffects(root.deck).length === 2);
    expect(getEffects(root.deck).map(({id}) => id)).toEqual([
      'identity-pass/first',
      'identity-pass/second'
    ]);
  } finally {
    root.unmount();
  }
});

webglTest('two <deckEffect> elements of one kind keep the ids set on them', async () => {
  const root = mountDeck();
  const first = new PostProcessEffect(identity, {});
  const second = new PostProcessEffect(identity, {});
  first.id = 'identity-a';
  second.id = 'identity-b';

  try {
    await root.render({latitude: 0, longitude: 0, zoom: 1}, [
      <deckEffect key="first" effect={first} />,
      <deckEffect key="second" effect={second} />
    ]);
    await waitFor(() => getEffects(root.deck).length === 2);
    expect(getEffects(root.deck).map(({id}) => id)).toEqual(['identity-a', 'identity-b']);
  } finally {
    root.unmount();
  }
});
