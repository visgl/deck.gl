// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrbitView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  DarkGlassTheme,
  LightGlassTheme
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

/* global window */
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const widgetTheme = prefersDarkScheme.matches ? DarkGlassTheme : LightGlassTheme;

function generateData(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      position: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
      color: [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    });
  }
  return result;
}

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 45,
  rotationOrbit: 0,
  zoom: 0
};

new Deck({
  views: new OrbitView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'scatter',
      data: generateData(500),
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 3,
      pickable: true,
      autoHighlight: true
    })
  ],
  widgets: [
    new ZoomWidget({style: widgetTheme}),
    new CompassWidget({style: widgetTheme}),
    new FullscreenWidget({style: widgetTheme})
  ]
});
