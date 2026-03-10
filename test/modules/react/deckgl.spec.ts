// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import {test, expect} from 'vitest';
import {createElement, createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';

import {DeckGL, Layer, Widget} from 'deck.gl';
import {type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

import {gl} from '@deck.gl/test-utils/vitest';

const TEST_VIEW_STATE = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

// If testing under node, provide a headless context
/* global document */
const getMockContext = () => (globalThis.__JSDOM__ ? gl : null);

test('DeckGL#mount/unmount', () => {
  const ref = createRef();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100,
        gl: getMockContext(),
        onLoad: () => {
          const {deck} = ref.current;
          expect(deck, 'DeckGL is initialized').toBeTruthy();
          const viewport = deck.getViewports()[0];
          expect(viewport && viewport.longitude, 'View state is set').toBe(
            TEST_VIEW_STATE.longitude
          );

          act(() => {
            root.render(null);
          });

          expect(deck.animationLoop, 'Deck is finalized').toBeFalsy();

          container.remove();
        }
      })
    );
  });
  expect(ref.current, 'DeckGL overlay is rendered.').toBeTruthy();
});

test('DeckGL#render', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    createElement(
      DeckGL,
      {
        viewState: TEST_VIEW_STATE,
        width: 100,
        height: 100,
        gl: getMockContext(),
        onAfterRender: () => {
          const child = container.querySelector('.child');
          expect(child, 'Child is rendered').toBeTruthy();

          root.render(null);
          container.remove();
        }
      },
      [createElement('div', {key: 0, className: 'child'}, 'Child')]
    )
  );
});

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

const LAYERS = [new TestLayer({id: 'primitive'})];

class TestWidget extends Widget<WidgetProps> {
  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';

  constructor(props: WidgetProps = {}) {
    super(props, Widget.defaultProps);
  }

  onRenderHTML(rootElement: HTMLElement): void {}
}

const WIDGETS = [new TestWidget({id: 'A'})];

test('DeckGL#props omitted are reset', () => {
  const ref = createRef();
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
        gl: getMockContext(),
        layers: LAYERS,
        widgets: WIDGETS,
        onLoad: () => {
          const {deck} = ref.current;
          expect(deck, 'DeckGL is initialized').toBeTruthy();
          const {widgets, layers} = deck.props;
          expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
          expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

          act(() => {
            // Render deck a second time without setting widget or layer props.
            root.render(
              createElement(DeckGL, {
                ref,
                onAfterRender: () => {
                  const {deck} = ref.current;
                  const {widgets, layers} = deck.props;
                  expect(
                    widgets && Array.isArray(widgets) && widgets.length,
                    'Widgets is reset to an empty array'
                  ).toBe(0);
                  expect(
                    layers && Array.isArray(layers) && layers.length,
                    'Layers is reset to an empty array'
                  ).toBe(0);

                  root.render(null);
                  container.remove();
                }
              })
            );
          });
        }
      })
    );
  });
  expect(ref.current, 'DeckGL overlay is rendered.').toBeTruthy();
});
