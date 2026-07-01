// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {
  OrbitView,
  type OrbitViewState,
  OrthographicView,
  type OrthographicViewState
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {
  DeckGL,
  FullscreenWidget,
  GimbalWidget,
  ResetViewWidget,
  ScrollbarWidget,
  InfoWidget,
  ThemeWidget,
  ZoomWidget
} from '@deck.gl/react';
import {DarkTheme, LightTheme} from '@deck.gl/widgets';
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

const VIEWS = [
  new OrbitView({id: 'orbit-view', x: 0, width: '50%', controller: true}),
  new OrthographicView({
    id: 'ortho-view',
    x: '50%',
    width: '50%',
    controller: {
      maxBounds: [
        [-50, -50, -50],
        [50, 50, 50]
      ]
    }
  })
];

const LAYERS = [
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
];

function App() {
  const [viewState, setViewState] = useState({
    'orbit-view': INITIAL_ORBIT_VIEW_STATE,
    'ortho-view': INITIAL_ORTHO_VIEW_STATE
  });
  const onViewStateChange = useCallback(
    ({viewId, viewState}: {viewId: string; viewState: OrthographicViewState}) => {
      setViewState(curr => ({...curr, [viewId]: viewState}));
    },
    []
  );

  return (
    <DeckGL
      views={VIEWS}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      layers={LAYERS}
    >
      <ZoomWidget />
      <GimbalWidget />
      <FullscreenWidget />
      <ResetViewWidget />
      <ThemeWidget darkModeTheme={DarkTheme} lightModeTheme={LightTheme} />
      <InfoWidget
        viewId="ortho-view"
        mode="hover"
        getTooltip={({object}) => object ? 'point' : null}
      />
      <ScrollbarWidget
        id="scrollbar-v"
        viewId="ortho-view"
        placement="bottom-right"
        orientation="vertical"
      />
      <ScrollbarWidget
        id="scrollbar-h"
        viewId="ortho-view"
        placement="bottom-right"
        orientation="horizontal"
      />
    </DeckGL>
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
