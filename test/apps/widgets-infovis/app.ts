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
  _FpsWidget
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

const ORTHOGRAPHIC_POINTS = [
  {position: [-40, -20, 0], color: [255, 99, 71]},
  {position: [-10, 30, 0], color: [65, 105, 225]},
  {position: [25, -5, 0], color: [60, 179, 113]},
  {position: [40, 35, 0], color: [238, 130, 238]}
];

new Deck({
  views: [
    new OrbitView({id: 'orbit-view', x: 0, width: '50%'}),
    new OrthographicView({id: 'ortho-view', x: '50%', width: '50%'})
  ],
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'scatter',
      viewId: 'orbit-view',
      data: generateData(500),
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 3,
      pickable: true,
      autoHighlight: true,
      billboard: true
    }),
    new ScatterplotLayer({
      id: 'ortho-scatter',
      viewId: 'ortho-view',
      data: ORTHOGRAPHIC_POINTS,
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 8,
      pickable: true,
      autoHighlight: true
    })
  ],
  widgets: [
    new ZoomWidget(),
    new GimbalWidget(),
    new FullscreenWidget(),
    new ResetViewWidget(),
    new _FpsWidget()
  ]
});
