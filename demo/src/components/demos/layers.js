import createLayerDemoClass from './layer-base';

import {
  ScatterplotLayer
} from 'deck.gl';

export const ScatterplotLayerDemo = createLayerDemoClass({
  Layer: ScatterplotLayer,
  dataUrl: 'data/bart-ridership.json',
  formatTooltip: f => f.properties.description,
  props: {
    pickable: true,
    opacity: 0.8,
    radiusScale: 10,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: f => f.geometry.coordinates,
    getRadius: f => Math.sqrt(f.properties.exits),
    getColor: f => [255, 140, 0]
  }
});

