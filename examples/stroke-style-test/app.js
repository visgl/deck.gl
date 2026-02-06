// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {ScatterplotLayer, _TextBackgroundLayer as TextBackgroundLayer} from '@deck.gl/layers';
import {StrokeStyleExtension} from '@deck.gl/extensions';

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.4,
  zoom: 12,
  bearing: 0,
  pitch: 0
};

// Sample data for ScatterplotLayer - circles at different positions
const SCATTERPLOT_DATA = [
  // Dashed stroke, filled
  {
    position: [-122.41, 37.79],
    radius: 300,
    dashArray: [3, 2],
    fillColor: [255, 200, 0, 180],
    lineColor: [0, 100, 200]
  },
  {
    position: [-122.4, 37.79],
    radius: 250,
    dashArray: [5, 2],
    fillColor: [100, 255, 100, 180],
    lineColor: [0, 0, 0]
  },
  {
    position: [-122.39, 37.79],
    radius: 200,
    dashArray: [2, 1],
    fillColor: [255, 100, 100, 180],
    lineColor: [50, 50, 150]
  },
  // Solid stroke for comparison
  {
    position: [-122.38, 37.79],
    radius: 200,
    dashArray: [0, 0],
    fillColor: [200, 200, 255, 180],
    lineColor: [100, 0, 100]
  },
  // Dashed stroke, stroked only (no fill)
  {
    position: [-122.41, 37.78],
    radius: 300,
    dashArray: [4, 3],
    fillColor: [0, 0, 0, 0],
    lineColor: [255, 0, 0]
  },
  {
    position: [-122.4, 37.78],
    radius: 250,
    dashArray: [6, 2],
    fillColor: [0, 0, 0, 0],
    lineColor: [0, 150, 0]
  }
];

// Sample data for TextBackgroundLayer - rectangles at different positions
const TEXT_BG_DATA = [
  // Sharp corners
  {
    position: [-122.41, 37.77],
    bounds: [-60, -20, 60, 20],
    borderRadius: 0,
    dashArray: [4, 2],
    lineColor: [0, 0, 0]
  },
  // Rounded corners
  {
    position: [-122.4, 37.77],
    bounds: [-50, -25, 50, 25],
    borderRadius: 8,
    dashArray: [3, 2],
    lineColor: [0, 100, 200]
  },
  // Very rounded corners
  {
    position: [-122.39, 37.77],
    bounds: [-40, -20, 40, 20],
    borderRadius: 15,
    dashArray: [5, 3],
    lineColor: [200, 0, 100]
  },
  // Solid stroke for comparison
  {
    position: [-122.38, 37.77],
    bounds: [-40, -20, 40, 20],
    borderRadius: 8,
    dashArray: [0, 0],
    lineColor: [100, 100, 100]
  },
  // Different aspect ratios
  {
    position: [-122.41, 37.76],
    bounds: [-80, -15, 80, 15],
    borderRadius: 10,
    dashArray: [6, 2],
    lineColor: [50, 100, 50]
  },
  {
    position: [-122.39, 37.76],
    bounds: [-30, -40, 30, 40],
    borderRadius: 12,
    dashArray: [3, 1],
    lineColor: [100, 50, 150]
  }
];

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    // ScatterplotLayer with dashed strokes
    new ScatterplotLayer({
      id: 'scatterplot-dashed',
      data: SCATTERPLOT_DATA,
      getPosition: d => d.position,
      getRadius: d => d.radius,
      getFillColor: d => d.fillColor,
      getLineColor: d => d.lineColor,
      getDashArray: d => d.dashArray,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 4,
      pickable: true,
      autoHighlight: true,
      extensions: [new StrokeStyleExtension({dash: true})]
    }),

    // TextBackgroundLayer with dashed strokes
    new TextBackgroundLayer({
      id: 'text-bg-dashed',
      data: TEXT_BG_DATA,
      getPosition: d => d.position,
      getBoundingRect: d => d.bounds,
      getBorderRadius: d => d.borderRadius,
      getLineColor: d => d.lineColor,
      getFillColor: [255, 255, 255, 200],
      getLineWidth: 2,
      getDashArray: d => d.dashArray,
      pickable: true,
      autoHighlight: true,
      extensions: [new StrokeStyleExtension({dash: true})]
    })
  ]
});
