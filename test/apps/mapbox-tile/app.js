/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';

import MapLayer from './map-layer/map-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -122.45,
  latitude: 37.78,
  zoom: 12,
  minZoom: 2,
  maxZoom: 14
};

const MAP_LAYER_STYLES = {
  source: 'https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=U0iNgiZKlYdwvgs9UPm1',

  stroked: false,

  getLineColor: [192, 192, 192],

  getFillColor: f => {
    switch (f.properties.layer) {
      case 'water':
        return [140, 170, 180];
      case 'landcover':
        return [120, 190, 100];
      default:
        return [218, 218, 218];
    }
  },

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

  getPointRadius: 100,
  pointRadiusMinPixels: 2
};

class Root extends Component {
  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[
          new MapLayer({
            ...MAP_LAYER_STYLES,
            pickable: true,
            onClick: info => console.log(info.object.properties) // eslint-disable-line
          })
        ]}
      />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
