// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map, NavigationControl, useControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  LoadingWidget,
  PopupWidget,
  ThemeWidget,
  ScreenshotWidget
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: (d: any) => d.features.filter(f => f.properties.scalerank < 4),
      getSourcePosition: f => [-0.4531566, 51.4709959],
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ];

  const widgets = [
    // Widgets positioned by the map's native control container
    new FullscreenWidget({viewId: 'mapbox', placement: 'top-left'}),
    new LoadingWidget({viewId: 'mapbox', placement: 'top-left'}),
    new ScreenshotWidget({viewId: 'mapbox', placement: 'top-right'}),
    new CompassWidget({viewId: 'mapbox', placement: 'top-right'}),
    new ZoomWidget({viewId: 'mapbox', placement: 'top-right'}),
    // Widgets positioned by deck's overlay
    new PopupWidget({
      position: [-5, 52],
      content: 'Deck overlay widget',
      closeOnClickOutside: true
    }),
    new ThemeWidget({placement: 'bottom-left'})
  ];

  return (
    <Map
      initialViewState={{latitude: 51.47, longitude: 0.45, zoom: 4, bearing: 0, pitch: 30}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      style={{width: '100%', height: '100vh'}}
    >
      <DeckGLOverlay layers={layers} widgets={widgets} />
      <NavigationControl position="top-right" />
    </Map>
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
