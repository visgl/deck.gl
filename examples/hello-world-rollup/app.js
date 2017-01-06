import 'babel-polyfill';
import React, {Component} from 'react';
import {render} from 'react-dom';
// import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl/react';
import {LineLayer} from 'deck.gl';
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
      // <MapGL
      //   latitude={viewport.latitude}
      //   longitude={viewport.longitude}
      //   zoom={viewport.zoom}
      //   bearing={viewport.bearing}
      //   pitch={viewport.pitch}
      //   width={width}
      //   height={height}
      //   mapStyle="mapbox://styles/mapbox/dark-v9"
      //   mapboxApiAccessToken={MAPBOX_TOKEN}
      //   perspectiveEnabled
      //   onChangeViewport={v => this.setState({viewport: v})}>
        <DeckGL
          latitude={viewport.latitude}
          longitude={viewport.longitude}
          zoom={viewport.zoom}
          bearing={viewport.bearing}
          pitch={viewport.pitch}
          width={width}
          height={height}
          layers={layers}/>
      // </MapGL>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);
render(<Root />, root);
