// Minimal ColumnLayer Cap Shape Example
// This can be added to any deck.gl project

import {Deck} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

// Sample data - create a grid of columns
const data = [];
for (let x = -2; x <= 2; x++) {
  for (let y = -2; y <= 2; y++) {
    data.push({
      position: [-122.4 + x * 0.01, 37.8 + y * 0.01],
      elevation: Math.random() * 3000 + 1000,
      color: [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255]
    });
  }
}

// Create three layers to show all cap shapes side by side
const layers = [
  // Flat cap (left)
  new ColumnLayer({
    id: 'flat-columns',
    data: data.map(d => ({...d, position: [d.position[0] - 0.03, d.position[1]]})),
    diskResolution: 20,
    radius: 200,
    extruded: true,
    capShape: 'flat', // Default
    getPosition: d => d.position,
    getFillColor: d => d.color,
    getElevation: d => d.elevation,
    pickable: true
  }),
  
  // Rounded cap (middle)
  new ColumnLayer({
    id: 'rounded-columns',
    data: data,
    diskResolution: 20,
    radius: 200,
    extruded: true,
    capShape: 'rounded', // Dome-shaped
    getPosition: d => d.position,
    getFillColor: d => d.color,
    getElevation: d => d.elevation,
    pickable: true
  }),
  
  // Pointy cap (right)
  new ColumnLayer({
    id: 'pointy-columns',
    data: data.map(d => ({...d, position: [d.position[0] + 0.03, d.position[1]]})),
    diskResolution: 20,
    radius: 200,
    extruded: true,
    capShape: 'pointy', // Cone-shaped
    getPosition: d => d.position,
    getFillColor: d => d.color,
    getElevation: d => d.elevation,
    pickable: true
  })
];

// Initialize deck.gl
new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 13,
    pitch: 45,
    bearing: 0
  },
  controller: true,
  layers: layers,
  getTooltip: ({object}) => object && `Elevation: ${object.elevation.toFixed(0)}m`
});
