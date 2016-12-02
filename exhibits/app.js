import 'babel-polyfill';

import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl/react';
import {LineLayer} from 'deck.gl';
import MapGL from 'react-map-gl';

const token = '';

if (!token) {
  throw new Error('Please specify a valid mapbox token');
}

class Root extends Component {

  state = {
    viewport: {
      latitude: 37.785164,
      longitude: -122.41669,
      zoom: 16.140440,
      bearing: -20.55991,
      pitch: 60,
    },
    width: 500,
    height: 500,
  }

  render() {

    const {viewport, width, height} = this.state;

    const layers = [new LineLayer({
      data: [{
        sourcePosition: [-122.41669, 37.7853],
        targetPosition: [-122.41669, 37.781],
      }],
    })];

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onChangeViewport={v => this.setState({viewport: v})}
        preventStyleDiffing={false}
        mapboxApiAccessToken={token}
        perspectiveEnabled
        width={width}
        height={height}>
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          layers={layers}
          debug />
      </MapGL>
    );
  }

}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Root />, root);
