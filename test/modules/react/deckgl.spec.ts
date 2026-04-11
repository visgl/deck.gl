// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import {test, expect} from 'vitest';
import {createElement, createRef, act} from 'react';
import {createRoot} from 'react-dom/client';

import {Layer, Widget} from '@deck.gl/core';
import DeckGL, {type DeckGLRef} from '@deck.gl/react';
import {type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

import {device, gl} from '@deck.gl/test-utils/vitest';

// Required by React 19
// @ts-expect-error undefined global flag
self.IS_REACT_ACT_ENVIRONMENT = true;

const TEST_VIEW_STATE = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

// If testing under node, provide a headless context
/* global document */
const getDeckProps = () => (globalThis.__JSDOM__ ? {gl} : {device});

test('DeckGL#mount/unmount', async () => {
  const ref = createRef<DeckGLRef>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  const loadPromise = new Promise<void>(resolve => {
    act(() => {
      root.render(
        createElement(DeckGL, {
          initialViewState: TEST_VIEW_STATE,
          ref,
          width: 100,
          height: 100,
          ...getDeckProps(),
          onLoad: () => resolve()
        })
      );
    });
  });
  await loadPromise;

  expect(ref.current, 'DeckGL overlay is rendered.').toBeTruthy();

  const {deck} = ref.current!;
  expect(deck).toBeTruthy();
  expect(deck, 'DeckGL is initialized').toBeTruthy();
  const viewport = deck!.getViewports()[0];
  expect(viewport && viewport.longitude, 'View state is set').toBe(TEST_VIEW_STATE.longitude);

  act(() => {
    root.render(null);
  });

  expect(deck!.animationLoop, 'Deck is finalized').toBeFalsy();

  container.remove();
});

test('DeckGL#render', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  const renderPromise = new Promise<void>(resolve => {
    act(() => {
      root.render(
        createElement(
          DeckGL,
          {
            initialViewState: TEST_VIEW_STATE,
            width: 100,
            height: 100,
            ...getDeckProps(),
            onAfterRender: () => resolve()
          },
          createElement('div', {className: 'child'}, 'Child')
        )
      );
    });
  });
  await renderPromise;

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

  let renderPromise = new Promise<void>(resolve => {
    // Initialize widgets and layers on first render.
    act(() => {
      root.render(
        createElement(DeckGL, {
          initialViewState: TEST_VIEW_STATE,
          ref,
          width: 100,
          height: 100,
          ...getDeckProps(),
          layers: LAYERS,
          widgets: WIDGETS,
          onLoad: () => resolve()
        })
      );
    });
  });
  await renderPromise;

  const {deck} = ref.current!;
  expect(deck, 'DeckGL is initialized').toBeTruthy();
  let {widgets, layers} = deck!.props;
  expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
  expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

  renderPromise = new Promise<void>(resolve => {
    act(() => {
      // Render deck a second time without setting widget or layer props.
      root.render(
        createElement(DeckGL, {
          ref,
          ...getDeckProps(),
          onAfterRender: () => resolve()
        })
      );
    });
  });
  await renderPromise;

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
