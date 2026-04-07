// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Manual testing app for controlled widget state and callbacks.
// Run with: cd test/apps/controlled-widgets && npm run start-local

import React, {useState, useCallback, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL, GeoJsonLayer} from 'deck.gl';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ThemeWidget,
  ResetViewWidget,
  LoadingWidget,
  _TimelineWidget as TimelineWidget,
  _StatsWidget as StatsWidget,
  _SplitterWidget as SplitterWidget
} from '@deck.gl/widgets';
import {MapView} from '@deck.gl/core';
import type {MapViewState, View} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

// Sidebar panel to show current state
function StatePanel({state}: {state: Record<string, unknown>}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: 12,
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 11,
        maxHeight: '90vh',
        overflow: 'auto',
        zIndex: 1000,
        minWidth: 260
      }}
    >
      <div style={{fontWeight: 'bold', marginBottom: 8, color: '#fff', fontSize: 13}}>
        Widget State
      </div>
      {Object.entries(state).map(([key, value]) => (
        <div key={key} style={{marginBottom: 4}}>
          <span style={{color: '#aaa'}}>{key}: </span>
          <span>{JSON.stringify(value)}</span>
        </div>
      ))}
    </div>
  );
}

function MapViewDemo() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11,
    pitch: 45,
    bearing: 30
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastCallback, setLastCallback] = useState('(none)');

  const onViewStateChange = useCallback(({viewState: vs}) => {
    setViewState(vs as MapViewState);
  }, []);

  const widgets = useMemo(
    () => [
      new CompassWidget({
        placement: 'top-left',
        onReset: ({bearing, pitch}) =>
          setLastCallback(`CompassWidget.onReset(bearing=${bearing}, pitch=${pitch})`)
      }),
      new ZoomWidget({
        placement: 'top-left',
        onZoom: ({delta, zoom}) =>
          setLastCallback(`ZoomWidget.onZoom(delta=${delta}, zoom=${zoom.toFixed(1)})`)
      }),
      new ResetViewWidget({
        placement: 'top-left',
        initialViewState: {longitude: -122.4, latitude: 37.8, zoom: 11, pitch: 45, bearing: 30},
        onReset: () => setLastCallback('ResetViewWidget.onReset')
      }),
      new FullscreenWidget({
        placement: 'top-left',
        onFullscreenChange: fs => setLastCallback(`FullscreenWidget.onFullscreenChange(${fs})`)
      }),
      new ThemeWidget({placement: 'top-left', themeMode, onThemeModeChange: setThemeMode}),
      new LoadingWidget({placement: 'top-left', onLoadingChange: setLoading}),
      new StatsWidget({placement: 'top-left', expanded, onExpandedChange: setExpanded}),
      new TimelineWidget({
        placement: 'bottom-left',
        timeRange: [0, 100],
        step: 1,
        time,
        onTimeChange: setTime,
        playing,
        onPlayingChange: (next: boolean) => {
          // Reset to beginning when starting play at the end
          if (next && time >= 100) {
            setTime(0);
          }
          setPlaying(next);
        }
      })
    ],
    [themeMode, expanded, time, playing]
  );

  const layers = [
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    })
  ];

  return (
    <>
      <StatePanel
        state={{
          'viewState.bearing': Math.round(viewState.bearing ?? 0),
          'viewState.pitch': Math.round(viewState.pitch ?? 0),
          'viewState.zoom': (viewState.zoom ?? 0).toFixed(1),
          themeMode,
          statsExpanded: expanded,
          timelinePlaying: playing,
          timelineTime: time,
          loading,
          lastCallback
        }}
      />
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller
        layers={layers}
        widgets={widgets}
      />
    </>
  );
}

function SplitterDemo() {
  const [views, setViews] = useState<View[]>([]);
  const [viewState, setViewState] = useState<Record<string, MapViewState>>({
    left: {longitude: -122.4, latitude: 37.8, zoom: 11},
    right: {longitude: -73.97, latitude: 40.77, zoom: 11}
  });

  const widgets = useMemo(
    () => [
      new SplitterWidget({
        viewLayout: {
          orientation: 'horizontal',
          views: [
            new MapView({id: 'left', controller: true}),
            new MapView({id: 'right', controller: true})
          ]
        },
        onChange: setViews
      })
    ],
    []
  );

  const layers = [
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    })
  ];

  return (
    <>
      <StatePanel
        state={{
          viewCount: views.length,
          leftZoom: viewState.left?.zoom?.toFixed(1),
          rightZoom: viewState.right?.zoom?.toFixed(1)
        }}
      />
      <DeckGL
        views={views.length ? views : undefined}
        viewState={viewState}
        onViewStateChange={({viewId, viewState: vs}) => {
          setViewState(prev => ({...prev, [viewId]: vs as MapViewState}));
        }}
        layers={layers}
        widgets={widgets}
      />
    </>
  );
}

function App() {
  const [demo, setDemo] = useState<'map' | 'splitter'>('map');

  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          gap: 4
        }}
      >
        <button
          onClick={() => setDemo('map')}
          style={{
            padding: '6px 12px',
            background: demo === 'map' ? '#4466cc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Map Widgets
        </button>
        <button
          onClick={() => setDemo('splitter')}
          style={{
            padding: '6px 12px',
            background: demo === 'splitter' ? '#4466cc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Splitter
        </button>
      </div>
      {demo === 'map' ? <MapViewDemo /> : <SplitterDemo />}
    </>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<App />);
