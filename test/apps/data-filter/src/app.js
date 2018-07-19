/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM} from 'deck.gl';

import ScatterplotLayer from './scatterplot-layer';
import POINTS from './data-sample';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const INITIAL_VIEW_STATE = {
  longitude: -122.45,
  latitude: 37.78,
  zoom: 11
};

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {time: 0};

    this._animate = this._animate.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  _animate() {
    this.setState({time: Date.now()});
    window.requestAnimationFrame(this._animate);
  }

  _renderLayers() {
    const t = (this.state.time / 2000) % 0.5;
    const filterRange = [t, t + 0.5];

    return [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.45, 37.78],
        data: POINTS,

        // Data accessors
        getPosition: d => d,
        getColor: d => [0, 180, 255],
        getRadius: d => 8,
        getFilterValue: d => Math.sqrt(d[0] * d[0] + d[1] * d[1]) / 1e4,

        // Filter
        filterRange
      })
    ];
  }

  render() {
    return (
      <DeckGL
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        layers={this._renderLayers()} />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
