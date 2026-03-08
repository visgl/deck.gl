// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import test from 'tape-promise/tape';
import {createElement, createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';

import {DeckGL, Layer, Widget, MapView} from 'deck.gl';
import {type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

import {gl} from '@deck.gl/test-utils';

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
        gl: getMockContext(),
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
        gl: getMockContext(),
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
        gl: getMockContext(),
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

// A widget that takes ownership of `views` via updateDeckProps on mount.
class ViewManagingWidget extends Widget<WidgetProps> {
  placement: WidgetPlacement = 'top-left';
  className = 'deck-view-managing-widget';
  views: MapView[];

  constructor(views: MapView[], props: WidgetProps = {}) {
    super(props);
    this.views = views;
  }

  onAdd({deck}: {deck: any}): void {
    if (!deck.isControlled('views')) {
      this.updateDeckProps({views: this.views});
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {}
}

test('DeckGL#widget-managed views survive re-render', t => {
  const ref = createRef<any>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  const widgetViews = [new MapView({id: 'widget-view'})];
  const widget = new ViewManagingWidget(widgetViews);

  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100,
        gl: getMockContext(),
        widgets: [widget],
        onLoad: () => {
          const {deck} = ref.current;
          t.notOk(deck.isControlled('views'), 'views is not user-controlled');
          t.ok(deck.props.views?.length, 'widget-set views are applied');

          act(() => {
            root.render(
              createElement(DeckGL, {
                ref,
                width: 100,
                height: 100,
                gl: getMockContext(),
                widgets: [widget],
                onAfterRender: () => {
                  const {deck} = ref.current;
                  t.notOk(
                    deck.isControlled('views'),
                    'views still not user-controlled after re-render'
                  );
                  t.ok(deck.props.views?.length, 'widget-set views survive re-render');

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

test('DeckGL#user views override widget views', t => {
  const ref = createRef<any>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  const widgetViews = [new MapView({id: 'widget-view'})];
  const userViews = [new MapView({id: 'user-view'})];
  const widget = new ViewManagingWidget(widgetViews);

  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100,
        gl: getMockContext(),
        views: userViews,
        widgets: [widget],
        onLoad: () => {
          const {deck} = ref.current;
          t.ok(deck.isControlled('views'), 'views is user-controlled');
          t.is(
            deck.props.views?.[0]?.id,
            'user-view',
            'user-declared views are not overwritten by widget'
          );

          root.render(null);
          container.remove();
          t.end();
        }
      })
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});

test('DeckGL#wrapper-owned keys are not user-controlled', t => {
  const ref = createRef<any>();
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
          t.notOk(deck.isControlled('style'), 'style is not user-controlled');
          t.notOk(deck.isControlled('width'), 'width is not user-controlled');
          t.notOk(deck.isControlled('height'), 'height is not user-controlled');
          t.notOk(deck.isControlled('parent'), 'parent is not user-controlled');
          t.notOk(deck.isControlled('canvas'), 'canvas is not user-controlled');
          t.notOk(
            deck.isControlled('onViewStateChange'),
            'onViewStateChange is not user-controlled'
          );
          t.notOk(
            deck.isControlled('onInteractionStateChange'),
            'onInteractionStateChange is not user-controlled'
          );

          root.render(null);
          container.remove();
          t.end();
        }
      })
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});
