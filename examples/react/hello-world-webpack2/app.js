/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -122.41669,
        zoom: 16.14044,
        bearing: -20.55991,
        pitch: 60
      },
      width: 500,
      height: 500
    };
  }

  render() {
    const {viewport, width, height} = this.state;

    return (
      <MapGL {...viewport} width={width} height={height} mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGL {...viewport} width={width} height={height} debug>
          <LineLayer
            data={[{sourcePosition: [-122.41669, 37.7883], targetPosition: [-122.41669, 37.781]}]}
            strokeWidth={5}
          />
          <ScatterplotLayer
            data={[{position: [-122.41669, 37.79]}]}
            radiusScale={100}
            getColor={x => [0, 0, 255]}
          />
        </DeckGL>
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
