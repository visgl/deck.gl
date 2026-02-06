// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import test from 'tape-promise/tape';
import {StrictMode, createElement, createRef, act} from 'react';
import {createRoot} from 'react-dom/client';

import {DeckGL, Layer, Widget} from 'deck.gl';
import {useWidget} from '@deck.gl/react';
import {type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {gl} from '@deck.gl/test-utils';

const TEST_VIEW_STATE = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

/* global document */

test('DeckGL#mount/unmount', t => {
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
        gl: gl,
        onLoad: () => {
          const {deck} = ref.current;
          t.ok(deck, 'DeckGL is initialized');
          const viewport = deck.getViewports()[0];
          t.is(viewport && viewport.longitude, TEST_VIEW_STATE.longitude, 'View state is set');

          act(() => {
            root.render(null);
          });

          t.notOk(deck.animationLoop, 'Deck is finalized');

          container.remove();
          t.end();
        }
      })
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});

test('DeckGL#render', t => {
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
        gl: gl,
        onAfterRender: () => {
          const child = container.querySelector('.child');
          t.ok(child, 'Child is rendered');

          root.render(null);
          container.remove();
          t.end();
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

test('DeckGL#props omitted are reset', t => {
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
        gl: gl,
        layers: LAYERS,
        widgets: WIDGETS,
        onLoad: () => {
          const {deck} = ref.current;
          t.ok(deck, 'DeckGL is initialized');
          const {widgets, layers} = deck.props;
          t.is(widgets && Array.isArray(widgets) && widgets.length, 1, 'Widgets is set');
          t.is(layers && Array.isArray(layers) && layers.length, 1, 'Layers is set');

          act(() => {
            // Render deck a second time without setting widget or layer props.
            root.render(
              createElement(DeckGL, {
                ref,
                onAfterRender: () => {
                  const {deck} = ref.current;
                  const {widgets, layers} = deck.props;
                  t.is(
                    widgets && Array.isArray(widgets) && widgets.length,
                    0,
                    'Widgets is reset to an empty array'
                  );
                  t.is(
                    layers && Array.isArray(layers) && layers.length,
                    0,
                    'Layers is reset to an empty array'
                  );

                  root.render(null);
                  container.remove();
                  t.end();
                }
              })
            );
          });
        }
      })
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});

class StrictModeWidget extends Widget<WidgetProps> {
  placement: WidgetPlacement = 'top-left';
  className = 'deck-strict-mode-widget';

  constructor(props: WidgetProps = {}) {
    super(props, Widget.defaultProps);
  }

  onRenderHTML(rootElement: HTMLElement): void {}
}

const StrictModeWidgetComponent = (props: WidgetProps) => {
  useWidget(StrictModeWidget, props);
  return null;
};

test('useWidget#StrictMode cleanup removes duplicate widgets', t => {
  const ref = createRef();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(
          DeckGL,
          {
            initialViewState: TEST_VIEW_STATE,
            ref,
            width: 100,
            height: 100,
            gl: gl,
            // onLoad is deferred by the React wrapper until after widget children
            // have registered, so widgets are available when this callback fires.
            onLoad: () => {
              const deck = ref.current?.deck;
              const widgets = deck?.props.widgets;

              t.ok(deck, 'DeckGL is initialized');
              t.is(widgets?.length, 1, 'Only one widget instance remains after StrictMode remount');

              // Clean up
              root.render(null);
              container.remove();
              t.end();
            }
          },
          createElement(StrictModeWidgetComponent, {id: 'strict-mode-widget'})
        )
      )
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});
