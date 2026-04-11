// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Deck,
  OrbitView,
  OrbitViewState,
  OrthographicView,
  OrthographicViewState
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {
  GimbalWidget,
  ZoomWidget,
  FullscreenWidget,
  ResetViewWidget,
  ScrollbarWidget,
  _TimelineWidget as TimelineWidget,
  ThemeWidget,
  DarkTheme,
  LightTheme
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

function generateData(count) {
  const result: {position: number[]; color: number[]}[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      position: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
      color: [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    });
  }
  return result;
}

const INITIAL_ORBIT_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 45,
  rotationOrbit: 0,
  zoom: 0
} as const satisfies OrbitViewState;

const INITIAL_ORTHO_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 0
} as const satisfies OrthographicViewState;

const INITIAL_VIEW_STATE = {
  'orbit-view': INITIAL_ORBIT_VIEW_STATE,
  'ortho-view': INITIAL_ORTHO_VIEW_STATE
};

new Deck({
  views: [
    new OrbitView({id: 'orbit-view', x: 0, width: '50%', controller: true}),
    new OrthographicView({id: 'ortho-view', x: '50%', width: '50%', controller: true})
  ],
  initialViewState: INITIAL_VIEW_STATE,
  layers: [
    new ScatterplotLayer({
      id: 'scatter',
      data: generateData(500),
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 3,
      pickable: true,
      autoHighlight: true,
      billboard: true
    })
  ],
  widgets: [
    new ZoomWidget(),
    new GimbalWidget(),
    new FullscreenWidget(),
    new ResetViewWidget(),
    new ThemeWidget({
      // darkModeTheme: DarkTheme,
      // lightModeTheme: LightTheme,
    }),
    new TimelineWidget({
      viewId: 'orbit-view',
      timeRange: [0, 600],
      formatLabel: (t: number) =>
        `${Math.floor(t / 60)
          .toString()
          .padStart(2, '0')}: ${(t % 60).toFixed(0).padStart(2, '0')}`
      // autoPlay: true
    }),
    new ScrollbarWidget({
      viewId: 'ortho-view',
      contentBounds: [
        [-50, -50, -50],
        [50, 50, 50]
      ],
      // decorations: [
      //   {
      //     contentBounds: [[10, 10, 0], [20, 20, 50]],
      //     color: 'yellow',
      //     title: 'test'
      //   }
      // ],
      placement: 'bottom-right',
      orientation: 'vertical'
    }),
    new ScrollbarWidget({
      viewId: 'ortho-view',
      contentBounds: [
        [-50, -50, -50],
        [50, 50, 50]
      ],
      placement: 'bottom-right',
      orientation: 'horizontal'
    })
  ]
});
