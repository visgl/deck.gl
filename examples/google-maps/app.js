/* global document, window */
import 'babel-polyfill';

import React, {Component} from 'react';
import {render} from 'react-dom';

import Map from './google-map';
import DeckGL, {autobind} from 'deck.gl/react';
import {LineLayer} from 'deck.gl';

// Set your mapbox token here (or set GoogleMapsKey env variable)
const GOOGLE_MAPS_KEY = 'AIzaSyCeRk_LkiWBq2QbGySDAjQXmucOPyKuqX0';

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
      width: window.innerWidth,
      height: window.innerHeight
    };
    autobind(this);
  }

  render() {
    const {viewport, width, height} = this.state;

    return (
      <div>
        <div style={{position: 'absolute', left: 0, top: 0}}>
          <Map
            latitude={viewport.latitude}
            longitude={viewport.longitude}
            zoom={viewport.zoom}
            width={width}
            height={height}
            apiKey={GOOGLE_MAPS_KEY}
            onChangeViewport={v => this.setState({viewport: v})}/>
        </div>

        <div style={{position: 'absolute', left: 0, top: 0}}>
          <DeckGL
            latitude={viewport.latitude}
            longitude={viewport.longitude}
            zoom={viewport.zoom}
            bearing={viewport.bearing}
            pitch={viewport.pitch}
            width={width}
            height={height}
            layers={[
              new LineLayer({
                data: [
                  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
                ]
              })
            ]}/>
        </div>
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);
render(<Root />, root);
