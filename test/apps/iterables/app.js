import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer} from 'deck.gl';

import createIterable from './create-iterable';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.4,
  zoom: 12
};

class Root extends Component {
  constructor(props) {
    super(props);

    this._data = createIterable({
      source: new Float32Array([
        -122.4,
        37.78,
        1000,
        255,
        200,
        0,
        -122.41,
        37.775,
        500,
        200,
        0,
        0,
        -122.39,
        37.8,
        500,
        0,
        40,
        200
      ]),
      length: 3,
      get: (src, index) => src.subarray(index * 6, index * 6 + 6)
    });
  }

  render() {
    const layers = [
      new ScatterplotLayer({
        data: this._data,
        getPosition: d => d.slice(0, 2),
        getRadius: d => d[2],
        getColor: d => d.slice(3),
        pickable: true,
        onClick: console.log // eslint-disable-line
      })
    ];

    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller={true}
        width="100%"
        height="100%"
      />
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
