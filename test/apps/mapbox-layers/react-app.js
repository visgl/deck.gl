/* global document */
import React, {useState, useRef, useCallback} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, ArcLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

import {MapboxLayer} from '@deck.gl/mapbox';

import {mapboxBuildingLayer, deckPoiLayer, deckRouteLayer} from './layers';
import {MapView, OrthographicView} from '@deck.gl/core';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  main: {
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

const mainView = new MapView({id: 'main', controller: true});
const widgetView = new OrthographicView({
  id: 'widget',
  controller: true,
  x: 20,
  y: 20,
  width: '20%',
  height: '20%',
  clear: true
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

function App() {
  // DeckGL and mapbox will both draw into this WebGL context
  const [glContext, setGLContext] = useState();
  const deckRef = useRef(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current.getMap();
    const deck = deckRef.current.deck;

    map.addLayer(mapboxBuildingLayer);
    map.addLayer(
      new MapboxLayer({id: 'deckgl-pois', deck, viewId: 'main'}),
      getFirstTextLayerId(map.getStyle())
    );
    map.addLayer(new MapboxLayer({id: 'deckgl-tour-route', deck, viewId: 'main'}));
  }, []);

  const layers = [
    new ScatterplotLayer(deckPoiLayer),
    new ArcLayer(deckRouteLayer),
    new ScatterplotLayer({id: 'widget-point', data: [{position: [0, 0]}], getRadius: 10})
  ];

  return (
    <DeckGL
      ref={deckRef}
      layers={layers}
      views={[mainView, widgetView]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onWebGLInitialized={setGLContext}
      glOptions={{stencil: true}}
      layerFilter={layerFilter}
    >
      {glContext && (
        <StaticMap
          ref={mapRef}
          gl={glContext}
          mapStyle="mapbox://styles/mapbox/light-v9"
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onLoad={onMapLoad}
        />
      )}
    </DeckGL>
  );
}

render(<App />, document.body.appendChild(document.createElement('div')));
