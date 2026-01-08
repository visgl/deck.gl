// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

// Generate sample data - grid of columns
const data = [];
for (let x = -2; x <= 2; x++) {
  for (let y = -2; y <= 2; y++) {
    data.push({
      position: [-122.4 + x * 0.01, 37.8 + y * 0.01],
      elevation: Math.random() * 3000 + 1000,
      color: [
        Math.floor(Math.random() * 200) + 55,
        Math.floor(Math.random() * 200) + 55,
        Math.floor(Math.random() * 200) + 55,
        255
      ]
    });
  }
}

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 13,
  pitch: 45,
  bearing: 0
};

function createLayer(capShape, diskResolution) {
  return new ColumnLayer({
    id: 'column-layer',
    data: data,
    diskResolution: diskResolution,
    radius: 200,
    extruded: true,
    capShape: capShape, // NEW: 'flat', 'rounded', or 'pointy'
    elevationScale: 1,
    getPosition: d => d.position,
    getFillColor: d => d.color,
    getElevation: d => d.elevation,
    pickable: true
  });
}

// Initialize deck.gl
const deckgl = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [createLayer('flat', 20)],
  getTooltip: ({object}) => object && `Elevation: ${object.elevation.toFixed(0)}m`
});

// Set up controls
const capShapeSelect = document.getElementById('capShape');
const diskResolutionSlider = document.getElementById('diskResolution');
const diskResValueSpan = document.getElementById('diskResValue');

function updateLayers() {
  const capShape = capShapeSelect.value;
  const diskResolution = parseInt(diskResolutionSlider.value);
  diskResValueSpan.textContent = diskResolution;
  
  console.log('[Example] Updating layer with:', { capShape, diskResolution });
  
  deckgl.setProps({
    layers: [createLayer(capShape, diskResolution)]
  });
  
  console.log('[Example] Layer update requested');
}

capShapeSelect.addEventListener('change', updateLayers);
diskResolutionSlider.addEventListener('input', updateLayers);

console.log('[Example] App initialized with capShape:', capShapeSelect.value);
