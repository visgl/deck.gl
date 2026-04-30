// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import {test, expect, vi} from 'vitest';
import {
  createElement,
  createRef,
  forwardRef,
  useEffect,
  useState,
  act,
  type Ref,
  type RefObject
} from 'react';
import {createRoot} from 'react-dom/client';

import {Layer, Widget, type WebMercatorViewport, type MapViewState} from '@deck.gl/core';
import DeckGL, {type DeckGLRef} from '@deck.gl/react';
import {type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

// Required by React 19
// @ts-expect-error undefined global flag
self.IS_REACT_ACT_ENVIRONMENT = true;

const TEST_VIEW_STATE: MapViewState = {
  latitude: 37.78,
  longitude: -122.45,
  zoom: 12
};

function waitUntilReady(ref: RefObject<DeckGLRef | null>): Promise<boolean> {
  return vi.waitUntil(() => {
    const deck = ref.current?.deck;
    return deck && deck.isInitialized && !deck.needsRedraw({clearRedrawFlags: false});
  });
}

test('DeckGL#mount/unmount', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100
      })
    );
  });
  await waitUntilReady(ref);

  const {deck} = ref.current!;
  expect(deck, 'DeckGL is initialized').toBeTruthy();
  const viewport = deck!.getViewports()[0] as WebMercatorViewport;
  expect(viewport && viewport.longitude, 'View state is set').toBe(TEST_VIEW_STATE.longitude);

  act(() => {
    root.render(null);
  });

  // @ts-expect-error protected member
  expect(deck!.animationLoop, 'Deck is finalized').toBeFalsy();

  container.remove();
});

test('DeckGL#render', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        DeckGL,
        {
          ref,
          initialViewState: TEST_VIEW_STATE,
          width: 100,
          height: 100
        },
        createElement('div', {className: 'child'}, 'Child')
      )
    );
  });
  await waitUntilReady(ref);

  const child = container.querySelector('.child');
  expect(child, 'Child is rendered').toBeTruthy();

  act(() => {
    root.render(null);
  });
  container.remove();
});

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

const LAYERS = [new TestLayer({id: 'primitive'})];

class TestWidget extends Widget<WidgetProps> {
  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';

  onRenderHTML(rootElement: HTMLElement): void {}
}

const WIDGETS = [new TestWidget({id: 'A'})];

test('DeckGL#props omitted are reset', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  // Initialize widgets and layers on first render.
  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100,
        layers: LAYERS,
        widgets: WIDGETS
      })
    );
  });
  await waitUntilReady(ref);

  const {deck} = ref.current!;
  expect(deck, 'DeckGL is initialized').toBeTruthy();
  let {widgets, layers} = deck!.props;
  expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
  expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

  act(() => {
    // Render deck a second time without setting widget or layer props.
    root.render(
      createElement(DeckGL, {
        ref
      })
    );
  });
  await waitUntilReady(ref);

  widgets = deck!.props.widgets;
  layers = deck!.props.layers;
  expect(
    widgets && Array.isArray(widgets) && widgets.length,
    'Widgets is reset to an empty array'
  ).toBe(0);
  expect(
    layers && Array.isArray(layers) && layers.length,
    'Layers is reset to an empty array'
  ).toBe(0);

  act(() => {
    root.render(null);
  });
  container.remove();
});

test('DeckGL#uncontrolled view state', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const onViewStateChange = vi.fn();

  act(() => {
    root.render(
      createElement(DeckGL, {
        controller: true,
        initialViewState: TEST_VIEW_STATE,
        onViewStateChange: e => {
          onViewStateChange(e);
        },
        ref,
        width: 100,
        height: 100
      })
    );
  });
  await waitUntilReady(ref);

  const deckInstance = ref.current!.deck!;

  act(() => {
    // @ts-expect-error protected method
    deckInstance._onViewStateChange({
      viewId: 'default-view',
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      }
    });
  });
  await waitUntilReady(ref);

  expect(onViewStateChange.mock.lastCall?.[0]?.viewState.longitude).toBe(0);
  expect(onViewStateChange.mock.lastCall?.[0]?.viewState.zoom).toBe(1);
  // Deck viewport should match internally tracked viewState
  const viewport = deckInstance.getViewports()[0] as WebMercatorViewport;
  expect(viewport.longitude).toBe(0);
  expect(viewport.zoom).toBe(1);

  act(() => {
    root.render(null);
  });

  container.remove();
});

test('DeckGL#controlled view state', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const onViewStateChange = vi.fn();

  const deckProps = {
    ref,
    controller: true,
    onViewStateChange: e => {
      onViewStateChange(e);
    },
    width: 100,
    height: 100
  };

  act(() => {
    root.render(createElement(DeckGL, {...deckProps, viewState: TEST_VIEW_STATE}));
  });
  await waitUntilReady(ref);

  const deckInstance = ref.current!.deck!;

  act(() => {
    // @ts-expect-error protected method
    deckInstance._onViewStateChange({
      viewId: 'default-view',
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      }
    });
  });
  await waitUntilReady(ref);

  expect(onViewStateChange.mock.lastCall?.[0]?.viewState.longitude).toBe(0);
  expect(onViewStateChange.mock.lastCall?.[0]?.viewState.zoom).toBe(1);
  // Deck viewport should match viewState (unchanged)
  let viewport = deckInstance.getViewports()[0] as WebMercatorViewport;
  expect(viewport.longitude).toBe(-122.45);
  expect(viewport.zoom).toBe(12);

  act(() => {
    root.render(
      createElement(DeckGL, {
        ...deckProps,
        viewState: {
          longitude: 0,
          latitude: 0,
          zoom: 2
        }
      })
    );
  });
  await waitUntilReady(ref);

  // Deck viewport should match viewState (new value)
  viewport = deckInstance.getViewports()[0] as WebMercatorViewport;
  expect(viewport.longitude).toBe(0);
  expect(viewport.zoom).toBe(2);

  act(() => {
    root.render(null);
  });
  container.remove();
});
