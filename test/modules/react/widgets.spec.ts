// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {createElement, createRef, act, type RefObject} from 'react';
import {createRoot} from 'react-dom/client';

import {
  MapView,
  OrthographicView,
  OrbitView,
  type Widget,
  type MapViewState,
  type OrthographicViewState,
  type OrbitViewState
} from '@deck.gl/core';
import DeckGL, {
  type DeckGLRef,
  CompassWidget,
  FullscreenWidget,
  ZoomWidget,
  GimbalWidget,
  _GeocoderWidget as GeocoderWidget,
  InfoWidget,
  PopupWidget,
  ContextMenuWidget,
  ScrollbarWidget,
  IconWidget,
  ToggleWidget,
  SelectorWidget,
  LoadingWidget,
  ResetViewWidget,
  _ScaleWidget as ScaleWidget,
  ScreenshotWidget,
  _SplitterWidget as SplitterWidget,
  ThemeWidget,
  _TimelineWidget as TimelineWidget,
  _StatsWidget as StatsWidget
} from '@deck.gl/react';
import {
  CompassWidget as CoreCompassWidget,
  FullscreenWidget as CoreFullscreenWidget,
  ZoomWidget as CoreZoomWidget,
  GimbalWidget as CoreGimbalWidget,
  _GeocoderWidget as CoreGeocoderWidget,
  InfoWidget as CoreInfoWidget,
  PopupWidget as CorePopupWidget,
  ContextMenuWidget as CoreContextMenuWidget,
  ScrollbarWidget as CoreScrollbarWidget,
  IconWidget as CoreIconWidget,
  ToggleWidget as CoreToggleWidget,
  SelectorWidget as CoreSelectorWidget,
  LoadingWidget as CoreLoadingWidget,
  ResetViewWidget as CoreResetViewWidget,
  _ScaleWidget as CoreScaleWidget,
  ScreenshotWidget as CoreScreenshotWidget,
  _SplitterWidget as CoreSplitterWidget,
  ThemeWidget as CoreThemeWidget,
  _TimelineWidget as CoreTimelineWidget,
  _StatsWidget as CoreStatsWidget
} from '@deck.gl/widgets';
import {gl} from '@deck.gl/test-utils/vitest';

// Required by React 19
// @ts-expect-error undefined global flag
self.IS_REACT_ACT_ENVIRONMENT = true;

const TEST_VIEW_STATE: MapViewState = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

const TEST_VIEWS: [MapView, OrthographicView, OrbitView] = [
  new MapView({id: 'map'}),
  new OrthographicView({id: 'ortho'}),
  new OrbitView({id: 'orbit'})
];

const TEST_INITIAL_VIEW_STATE = {
  map: TEST_VIEW_STATE,
  ortho: {target: [0, 0], zoom: 0} as OrthographicViewState,
  orbit: {target: [0, 0, 0], zoom: 0, rotationOrbit: 0, rotationX: 0} as OrbitViewState
};

const getDeckProps = () => (globalThis.__JSDOM__ ? {gl} : {});

function waitUntilReady(ref: RefObject<DeckGLRef | null>): Promise<boolean> {
  return vi.waitUntil(() => {
    const deck = ref.current?.deck;
    return deck && deck.isInitialized && !deck.needsRedraw({clearRedrawFlags: false});
  });
}

test('DeckGL#widgets React widget wrappers mount/unmount', async () => {
  const ref = createRef<DeckGLRef<typeof TEST_VIEWS>>();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(
        DeckGL<typeof TEST_VIEWS>,
        {
          ref,
          views: TEST_VIEWS,
          initialViewState: TEST_INITIAL_VIEW_STATE,
          width: 100,
          height: 100,
          ...getDeckProps()
        },
        createElement(CompassWidget, {}),
        createElement(FullscreenWidget, {}),
        createElement(ZoomWidget, {}),
        createElement(GimbalWidget, {viewId: 'orbit'}),
        createElement(GeocoderWidget, {}),
        createElement(InfoWidget, {mode: 'click'}),
        createElement(PopupWidget, {position: [0, 0], content: 'Popup'}),
        createElement(ContextMenuWidget, {menuItems: [{value: 'inspect', label: 'Inspect'}]}),
        createElement(ScrollbarWidget, {
          viewId: 'ortho',
          orientation: 'horizontal',
          contentBounds: [
            [-100, -50],
            [100, 50]
          ]
        }),
        createElement(IconWidget, {icon: './icon.png'}),
        createElement(ToggleWidget, {icon: './icon.png'}),
        createElement(SelectorWidget, {
          options: [{value: 'grid', icon: './grid.png', label: 'Grid'}]
        }),
        createElement(LoadingWidget, {}),
        createElement(ResetViewWidget, {}),
        createElement(ScaleWidget, {}),
        createElement(ScreenshotWidget, {}),
        createElement(SplitterWidget, {
          viewLayout: {
            orientation: 'horizontal',
            views: [new MapView({id: 'left'}), new MapView({id: 'right'})]
          }
        }),
        createElement(ThemeWidget, {}),
        createElement(TimelineWidget, {timeRange: [0, 100]}),
        createElement(StatsWidget, {})
      )
    );
  });
  await waitUntilReady(ref);

  let widgets = ref.current?.deck?.props.widgets as Widget[] | undefined;
  expect(widgets).toBeTruthy();
  expect(widgets).toHaveLength(20);
  expect(widgets?.[0]).toBeInstanceOf(CoreCompassWidget);
  expect(widgets?.[1]).toBeInstanceOf(CoreFullscreenWidget);
  expect(widgets?.[2]).toBeInstanceOf(CoreZoomWidget);
  expect(widgets?.[3]).toBeInstanceOf(CoreGimbalWidget);
  expect(widgets?.[4]).toBeInstanceOf(CoreGeocoderWidget);
  expect(widgets?.[5]).toBeInstanceOf(CoreInfoWidget);
  expect(widgets?.[6]).toBeInstanceOf(CorePopupWidget);
  expect(widgets?.[7]).toBeInstanceOf(CoreContextMenuWidget);
  expect(widgets?.[8]).toBeInstanceOf(CoreScrollbarWidget);
  expect(widgets?.[9]).toBeInstanceOf(CoreIconWidget);
  expect(widgets?.[10]).toBeInstanceOf(CoreToggleWidget);
  expect(widgets?.[11]).toBeInstanceOf(CoreSelectorWidget);
  expect(widgets?.[12]).toBeInstanceOf(CoreLoadingWidget);
  expect(widgets?.[13]).toBeInstanceOf(CoreResetViewWidget);
  expect(widgets?.[14]).toBeInstanceOf(CoreScaleWidget);
  expect(widgets?.[15]).toBeInstanceOf(CoreScreenshotWidget);
  expect(widgets?.[16]).toBeInstanceOf(CoreSplitterWidget);
  expect(widgets?.[17]).toBeInstanceOf(CoreThemeWidget);
  expect(widgets?.[18]).toBeInstanceOf(CoreTimelineWidget);
  expect(widgets?.[19]).toBeInstanceOf(CoreStatsWidget);

  // unmount all widgets
  act(() => {
    root.render(
      createElement(DeckGL<typeof TEST_VIEWS>, {
        ref,
        views: TEST_VIEWS,
        initialViewState: TEST_INITIAL_VIEW_STATE,
        width: 100,
        height: 100,
        ...getDeckProps()
      })
    );
  });
  widgets = ref.current?.deck?.props.widgets as Widget[] | undefined;
  expect(widgets).toHaveLength(0);

  act(() => {
    root.render(null);
  });
  container.remove();
});
