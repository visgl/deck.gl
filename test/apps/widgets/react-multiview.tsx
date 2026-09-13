// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {View, MapView} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {DeckGL, _SplitterWidget as SplitterWidget, SplitterWidgetProps} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4
};

const LAYERS = [
  new GeoJsonLayer({
    id: 'base-map',
    data: COUNTRIES,
    // Styles
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    opacity: 0.4,
    getLineColor: [60, 60, 60],
    getFillColor: [200, 200, 200]
  }),
  new GeoJsonLayer({
    id: 'airports',
    data: AIR_PORTS,
    // Styles
    filled: true,
    pointRadiusMinPixels: 2,
    pointRadiusScale: 2000,
    getPointRadius: f => 11 - f.properties.scalerank,
    getFillColor: [200, 0, 80, 180],
    // Interactive props
    pickable: true,
    autoHighlight: true
  }),
  new ArcLayer({
    id: 'arcs',
    data: AIR_PORTS,
    dataTransform: (d: any) => d.features.filter(f => f.properties.scalerank < 4),
    // Styles
    getSourcePosition: f => [-0.4531566, 51.4709959], // London
    getTargetPosition: f => f.geometry.coordinates,
    getSourceColor: [0, 128, 200],
    getTargetColor: [200, 0, 80],
    getWidth: 1
  })
];

const VIEW_LAYOUT: SplitterWidgetProps['viewLayout'] = {
  orientation: 'horizontal',
  views: [
    new MapView({id: 'left', controller: true}),
    {
      orientation: 'vertical',
      views: [
        new MapView({id: 'right-top', controller: true}),
        new MapView({id: 'right-bottom', controller: true})
      ]
    }
  ]
};

function App() {
  const [views, setViews] = useState<View[]>([new MapView({id: 'left'})]);

  return (
    <DeckGL
      views={views}
      // @ts-expect-error intentionally use the same initial state for all views
      initialViewState={INITIAL_VIEW_STATE}
      layers={LAYERS}
    >
      <SplitterWidget viewLayout={VIEW_LAYOUT} onChange={setViews} />
    </DeckGL>
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
