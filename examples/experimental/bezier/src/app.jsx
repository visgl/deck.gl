// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import BezierGraphLayer from './bezier-graph-layer';

import SAMPLE_GRAPH from './sample-graph.json';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 1
};

export default function App({data = SAMPLE_GRAPH}) {
  return (
    <DeckGL
      width="100%"
      height="100%"
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      views={new OrthographicView()}
      layers={[new BezierGraphLayer({data})]}
    />
  );
}

/* global document */
const container = document.getElementById('app');
createRoot(container).render(<App />);
