// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {
  ScatterplotLayer,
  TextLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.4,
  zoom: 12,
  bearing: 0,
  pitch: 0
};

// Fill-only circle for size comparison (no stroke)
const FILL_ONLY_DATA = [
  {
    position: [-122.42, 37.79],
    radius: 300,
    fillColor: [255, 200, 0, 180]
  }
];

// Sample data for ScatterplotLayer - circles at different positions
const SCATTERPLOT_DATA = [
  // Dashed stroke, filled - same radius as fill-only for comparison
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

// Labels for each element
const LABELS = [
  // Fill-only circle
  {position: [-122.42, 37.79], text: 'Fill only\n(no stroke)'},
  // Dashed filled circles
  {position: [-122.41, 37.79], text: 'Filled + dashed\ndash: [3,2]'},
  {position: [-122.4, 37.79], text: 'Filled + dashed\ndash: [5,2]'},
  {position: [-122.39, 37.79], text: 'Filled + dashed\ndash: [2,1]'},
  {position: [-122.38, 37.79], text: 'Filled + solid\n(no dash)'},
  // Stroke-only circles
  {position: [-122.41, 37.78], text: 'Stroke only\ndash: [4,3]'},
  {position: [-122.4, 37.78], text: 'Stroke only\ndash: [6,2]'},
  // Rectangles - position labels just below the shapes
  {position: [-122.395, 37.7685], text: 'Rounded rect\nborderRadius: 20\ndash: [4,2]'},
  {position: [-122.41, 37.759], text: 'Sharp corners\ndash: [4,2]'},
  {position: [-122.4, 37.759], text: 'Rounded\ndash: [3,2]'},
  {position: [-122.39, 37.759], text: 'Solid stroke\n(no dash)'}
];

// Sample data for TextBackgroundLayer - rectangles at different positions
// getBoundingRect format: [x, y, width, height] where x,y is offset from position
const TEXT_BG_DATA = [
  // Large rounded rectangle - prominent example (centered 240x100)
  {
    position: [-122.395, 37.77],
    bounds: [-120, -50, 240, 100],
    borderRadius: 25,
    dashArray: [4, 2],
    lineColor: [0, 100, 200]
  },
  // Sharp corners (centered 120x40)
  {
    position: [-122.41, 37.76],
    bounds: [-60, -20, 120, 40],
    borderRadius: 0,
    dashArray: [4, 2],
    lineColor: [0, 0, 0]
  },
  // Rounded corners (centered 100x50)
  {
    position: [-122.4, 37.76],
    bounds: [-50, -25, 100, 50],
    borderRadius: 12,
    dashArray: [3, 2],
    lineColor: [200, 0, 100]
  },
  // Solid stroke for comparison (centered 80x40)
  {
    position: [-122.39, 37.76],
    bounds: [-40, -20, 80, 40],
    borderRadius: 8,
    dashArray: [0, 0],
    lineColor: [100, 100, 100]
  }
];

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    // Fill-only circle for size comparison
    new ScatterplotLayer({
      id: 'scatterplot-fill-only',
      data: FILL_ONLY_DATA,
      getPosition: d => d.position,
      getRadius: d => d.radius,
      getFillColor: d => d.fillColor,
      stroked: false,
      filled: true,
      pickable: true,
      autoHighlight: true
    }),

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
      extensions: [new PathStyleExtension({dash: true})]
    }),

    // TextBackgroundLayer with dashed strokes, rounded corners, and colored fill
    new TextBackgroundLayer({
      id: 'text-bg-rounded',
      data: TEXT_BG_DATA.filter(d => d.borderRadius > 0),
      getPosition: d => d.position,
      getBoundingRect: d => d.bounds,
      borderRadius: 20,
      getLineColor: d => d.lineColor,
      getFillColor: [200, 230, 255, 200], // Light blue fill to test dash gaps show fill
      getLineWidth: 2,
      getDashArray: d => d.dashArray,
      pickable: true,
      autoHighlight: true,
      extensions: [new PathStyleExtension({dash: true})]
    }),

    // TextBackgroundLayer with dashed strokes and sharp corners
    new TextBackgroundLayer({
      id: 'text-bg-sharp',
      data: TEXT_BG_DATA.filter(d => d.borderRadius === 0),
      getPosition: d => d.position,
      getBoundingRect: d => d.bounds,
      borderRadius: 0,
      getLineColor: d => d.lineColor,
      getFillColor: [255, 230, 200, 200], // Light orange fill to test dash gaps show fill
      getLineWidth: 2,
      getDashArray: d => d.dashArray,
      pickable: true,
      autoHighlight: true,
      extensions: [new PathStyleExtension({dash: true})]
    }),

    // Labels for each element
    new TextLayer({
      id: 'labels',
      data: LABELS,
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 12,
      getColor: [60, 60, 60],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Monaco, monospace',
      fontWeight: 'bold',
      outlineWidth: 2,
      outlineColor: [255, 255, 255]
    })
  ]
});
