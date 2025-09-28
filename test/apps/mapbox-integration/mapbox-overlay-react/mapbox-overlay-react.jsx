// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import React, {useState, useRef, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {ScatterplotLayer, ArcLayer, TextLayer} from 'deck.gl';
import {Map, useControl} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import {MapboxOverlay} from '@deck.gl/mapbox';

import {mapboxBuildingLayer, deckPoiLayer, deckRouteLayer, deckTextLayer} from '../layers';
import {MapView, OrthographicView} from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  mapbox: {
    longitude: -74.012,
    latitude: 40.705,
    zoom: 15.5,
    bearing: -20,
    pitch: 45
  },
  widget: {
    target: [0, 0, 0],
    zoom: 0
  }
};

const mapboxView = new MapView({id: 'mapbox', controller: true});
const widgetView = new OrthographicView({
  id: 'widget',
  x: 20,
  y: 20,
  width: 150,
  height: 36
});

function layerFilter({layer, viewport}) {
  const shouldDrawInWidget = layer.id.startsWith('widget');
  if (viewport.id === 'widget') return shouldDrawInWidget;
  return !shouldDrawInWidget;
}

function getFirstTextLayerId(style) {
  const layers = style.layers;
  // Find the index of the first symbol (i.e. label) layer in the map style
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  return firstSymbolId;
}

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  // DeckGL and mapbox will both draw into this WebGL context
  const mapRef = useRef(null);
  const [layers, setLayers] = useState([
    new ScatterplotLayer(deckPoiLayer),
    new ArcLayer(deckRouteLayer),
    new TextLayer(deckTextLayer)
  ]);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current.getMap();

    map.addLayer(mapboxBuildingLayer);
    setLayers([
      new ScatterplotLayer({
        ...deckPoiLayer,
        beforeId: getFirstTextLayerId(map.getStyle())
      }),
      new ArcLayer(deckRouteLayer),
      new TextLayer(deckTextLayer)
    ]);
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW_STATE.mapbox}
      style={{position: 'absolute', width: '100%', height: '100%'}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      onLoad={onMapLoad}
    >
      <DeckGLOverlay
        interleaved
        layers={layers}
        views={[mapboxView, widgetView]}
        deviceProps={{type: 'webgl', webgl: {stencil: true}}}
        layerFilter={layerFilter}
      />
    </Map>
  );
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<App />);
