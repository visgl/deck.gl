import 'babel-polyfill';
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';
import {LineLayer} from 'deck.gl';
// import MapGL from 'react-map-gl';
/* global document */

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -122.41669,
        zoom: 16.140440,
        bearing: -20.55991,
        pitch: 60
      },
      width: 500,
      height: 500
    };
  }

  render() {
    const {viewport, width, height} = this.state;

    const layers = [new LineLayer({
      data: [{
        sourcePosition: [-122.41669, 37.7853],
        targetPosition: [-122.41669, 37.781]
      }]
    })];

    return (
      <DeckGL
        {...viewport}
        width={width}
        height={height}
        layers={layers}
        debug />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
