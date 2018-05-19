import React, {Component} from 'react';
import DeckGL, {PolygonLayer} from 'deck.gl';
import TripsLayer from './trips-layer';

// Source data
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

const LIGHT_SETTINGS = {
  lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
  ambientRatio: 0.05,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [2.0, 0.0, 0.0, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -74,
      latitude: 40.72,
      zoom: 13,
      maxZoom: 16,
      pitch: 45,
      bearing: 0
    };
  }

  render() {
    const {viewport, trailLength, time} = this.props;

    const layers = [
      new TripsLayer({
        id: 'trips',
        data: DATA_URL.TRIPS,
        getPath: d => d.segments,
        getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.3,
        strokeWidth: 2,
        trailLength,
        currentTime: time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: DATA_URL.BUILDINGS,
        extruded: true,
        wireframe: false,
        fp64: true,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: f => [74, 80, 87],
        lightSettings: LIGHT_SETTINGS
      })
    ];

    return <DeckGL {...viewport} layers={layers} />;
  }
}
