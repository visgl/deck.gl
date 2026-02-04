// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * React Widgets Test App
 *
 * Tests widget behavior in various scenarios:
 * - StrictMode ON/OFF
 * - JSX children vs widgets prop
 * - Reactive adding/removing widgets at runtime
 */

import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {FullscreenWidget, ZoomWidget, CompassWidget} from '@deck.gl/react';
import {
  FullscreenWidget as FullscreenWidgetClass,
  ZoomWidget as ZoomWidgetClass,
  CompassWidget as CompassWidgetClass
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

// Simple inline GeoJSON for testing (no external dependencies)
const SAMPLE_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [0.45, 51.47]},
      properties: {name: 'London'}
    },
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [2.35, 48.85]},
      properties: {name: 'Paris'}
    },
    {
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [-3.7, 40.42]},
      properties: {name: 'Madrid'}
    }
  ]
};

function ControlPanel({
  useStrictMode,
  setUseStrictMode,
  showCompass,
  setShowCompass,
  showZoom,
  setShowZoom,
  useWidgetsProp,
  setUseWidgetsProp
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        background: 'white',
        padding: 12,
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        fontSize: 13
      }}
    >
      <h4 style={{margin: '0 0 12px 0'}}>Widget Test Controls</h4>

      {/* StrictMode Toggle */}
      <div
        style={{
          marginBottom: 12,
          padding: 8,
          background: useStrictMode ? '#ffe0e0' : '#e0ffe0',
          borderRadius: 4
        }}
      >
        <button onClick={() => setUseStrictMode(!useStrictMode)} style={{fontWeight: 'bold'}}>
          StrictMode: {useStrictMode ? 'ON' : 'OFF'}
        </button>
        <div style={{fontSize: 11, marginTop: 4, color: '#666'}}>Toggling forces remount</div>
      </div>

      {/* Widget Mode Toggle */}
      <div style={{marginBottom: 12}}>
        <button
          onClick={() => setUseWidgetsProp(!useWidgetsProp)}
          style={{
            background: useWidgetsProp ? '#e0e0ff' : '#ffe0ff',
            padding: '6px 12px',
            border: '1px solid #999',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Mode: {useWidgetsProp ? 'widgets prop' : 'JSX children'}
        </button>
      </div>

      {/* Widget Visibility Toggles */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <input
            type="checkbox"
            checked={showCompass}
            onChange={e => setShowCompass(e.target.checked)}
            disabled={useWidgetsProp}
          />
          CompassWidget {useWidgetsProp && '(prop mode)'}
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <input
            type="checkbox"
            checked={showZoom}
            onChange={e => setShowZoom(e.target.checked)}
            disabled={useWidgetsProp}
          />
          ZoomWidget {useWidgetsProp && '(prop mode)'}
        </label>
        <div style={{fontSize: 11, color: '#666'}}>FullscreenWidget always shown</div>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: 12,
          padding: 8,
          background: '#f5f5f5',
          borderRadius: 4,
          fontSize: 11
        }}
      >
        <strong>Current Config:</strong>
        <br />
        StrictMode: {useStrictMode ? 'ON' : 'OFF'}
        <br />
        Mode: {useWidgetsProp ? 'widgets prop' : 'JSX children'}
        <br />
        Widgets: Fullscreen
        {showCompass ? ', Compass' : ''}
        {showZoom ? ', Zoom' : ''}
      </div>
    </div>
  );
}

function App() {
  // Test controls
  const [useStrictMode, setUseStrictMode] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showZoom, setShowZoom] = useState(true);
  const [useWidgetsProp, setUseWidgetsProp] = useState(false);

  // View state
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  // Layers
  const layers = [
    new GeoJsonLayer({
      id: 'points',
      data: SAMPLE_DATA,
      filled: true,
      pointRadiusMinPixels: 8,
      getFillColor: [200, 0, 80, 180],
      pickable: true
    })
  ];

  // Widgets for prop-based mode
  const widgetsProp = useMemo(() => {
    if (!useWidgetsProp) return undefined;
    const result = [new FullscreenWidgetClass()];
    if (showCompass) result.push(new CompassWidgetClass());
    if (showZoom) result.push(new ZoomWidgetClass());
    return result;
  }, [useWidgetsProp, showCompass, showZoom]);

  // Conditionally wrap in StrictMode
  const Wrapper = useStrictMode ? React.StrictMode : React.Fragment;

  return (
    <>
      <ControlPanel
        useStrictMode={useStrictMode}
        setUseStrictMode={setUseStrictMode}
        showCompass={showCompass}
        setShowCompass={setShowCompass}
        showZoom={showZoom}
        setShowZoom={setShowZoom}
        useWidgetsProp={useWidgetsProp}
        setUseWidgetsProp={setUseWidgetsProp}
      />
      <Wrapper key={useStrictMode ? 'strict' : 'normal'}>
        <DeckGL
          style={{position: 'absolute', top: 0, left: 0}}
          width="100%"
          height="100%"
          viewState={viewState}
          onViewStateChange={e => setViewState(e.viewState)}
          layers={layers}
          controller
          widgets={widgetsProp}
        >
          {/* JSX children mode */}
          {!useWidgetsProp && <FullscreenWidget />}
          {!useWidgetsProp && showCompass && <CompassWidget />}
          {!useWidgetsProp && showZoom && <ZoomWidget />}
        </DeckGL>
      </Wrapper>
    </>
  );
}

// Mount the app
const container = document.getElementById('root');
createRoot(container).render(<App />);
