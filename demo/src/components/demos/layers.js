import createLayerDemoClass from './layer-base';

import {
  ScatterplotLayer
} from 'deck.gl';

export const ScatterplotLayerDemo = createLayerDemoClass({
  Layer: ScatterplotLayer,
  dataUrl: 'data/bart-ridership.json',
  formatTooltip: d => d.description,
  props: {
    pickable: true,
    opacity: 0.8,
    radiusScale: 10,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getColor: d => [255, 140, 0]
  }
});

