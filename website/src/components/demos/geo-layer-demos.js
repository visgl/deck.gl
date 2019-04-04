/* global fetch */
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

import {
  GreatCircleLayer,
  S2Layer,
  TileLayer
} from 'deck.gl';

export const GreatCircleLayerDemo = createLayerDemoClass({
  Layer: GreatCircleLayer,
  dataUrl: `${DATA_URI}/flights.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    widthMinPixels: 5,
    pickable: true
  }
});

export const S2LayerDemo = createLayerDemoClass({
  Layer: S2Layer,
  dataUrl: `${DATA_URI}/sf.s2cells.json`,
  formatTooltip: d => d.token,
  props: {
    opacity: 0.6,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getS2Token: d => d.token,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128, 128],
    getElevation: d => d.value
  }
});

export const TileLayerDemo = createLayerDemoClass({
  Layer: TileLayer,
  formatTooltip: f => JSON.stringify(f.properties),
  allowMissingData: true,
  props: {
    stroked: false,
    opacity: 1,

    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],

    getLineWidth: f => {
      if (f.properties.layer === 'transportation') {
        switch (f.properties.class) {
        case 'primary':
          return 12;
        case 'motorway':
          return 16;
        default:
          return 6;
        }
      }
      return 1;
    },
    lineWidthMinPixels: 1,

    getTileData: ({x, y, z}) => {
      const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MapboxAccessToken}`;
      return fetch(mapSource)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const tile = new VectorTile(new Protobuf(buffer));
          const features = [];
          for (const layerName in tile.layers) {
            const vectorTileLayer = tile.layers[layerName];
            for (let i = 0; i < vectorTileLayer.length; i++) {
              const vectorTileFeature = vectorTileLayer.feature(i);
              const feature = vectorTileFeature.toGeoJSON(x, y, z);
              features.push(feature);
            }
          }
          return features;
        });
    }
  }
});
