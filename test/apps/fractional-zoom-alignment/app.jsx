// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
//
// Test app for https://github.com/visgl/deck.gl/issues/10173
// Change browser zoom (Cmd+/Cmd-) to verify deck.gl overlay stays aligned with Mapbox basemap.

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map, useControl} from 'react-map-gl/mapbox';
import {ScatterplotLayer} from 'deck.gl';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -80,
  latitude: 40,
  zoom: 3
};

const data = [
  {pos: [-80.0133149, 40.4554421]},
  {pos: [-8.0133149, 40.4554421]},
  {pos: [-84.0133149, 40.4554421]},
  {pos: [-86.0133149, 40.4554421]},
  {pos: [-88.0133149, 40.4554421]},
  {pos: [-80.0133149, 42.4554421]},
  {pos: [-80.0133149, 44.4554421]},
  {pos: [-80.0133149, 46.4554421]},
  {pos: [-80.0133149, 48.4554421]}
];

const layers = [
  new ScatterplotLayer({
    id: 'test',
    data,
    getPosition: d => d.pos,
    pickable: true,
    opacity: 1.0,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 1000,
    lineWidthMinPixels: 1,
    getRadius: 10000,
    getFillColor: [255, 140, 0],
    getLineColor: [0, 0, 0]
  })
];

function DeckGLOverlay(props) {
  const overlay = useControl(() => {
    const o = new DeckOverlay(props);
    window.__deckOverlay = o;
    return o;
  });
  overlay.setProps(props);
  return null;
}

function DiagPanel() {
  const [info, setInfo] = React.useState('');
  React.useEffect(() => {
    const update = () => {
      const deck = window.__deckOverlay?._deck;
      const mapCanvas = document.querySelector('.mapboxgl-canvas');
      const deckCanvas = document.getElementById('deckgl-overlay');
      if (!deck || !mapCanvas || !deckCanvas) return;
      const lines = [
        `DPR: ${window.devicePixelRatio.toFixed(4)}`,
        `Map draw: ${mapCanvas.width}x${mapCanvas.height}`,
        `Deck draw: ${deckCanvas.width}x${deckCanvas.height}`,
        `Map CSS: ${mapCanvas.clientWidth}x${mapCanvas.clientHeight}`,
        `Deck CSS: ${deckCanvas.clientWidth}x${deckCanvas.clientHeight}`,
        `Deck viewport: ${deck.width}x${deck.height}`,
        `Match: ${mapCanvas.width === deckCanvas.width && mapCanvas.height === deckCanvas.height}`
      ];
      setInfo(lines.join('\n'));
    };
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, []);
  return (
    <pre
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: 10,
        fontSize: 12,
        fontFamily: 'monospace',
        pointerEvents: 'none'
      }}
    >
      {info}
    </pre>
  );
}

function Root() {
  return (
    <>
      <DiagPanel />
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        dragRotate={false}
        touchPitch={false}
      >
        <DeckGLOverlay layers={layers} />
      </Map>
    </>
  );
}

/* global document */
createRoot(document.getElementById('root')).render(<Root />);
