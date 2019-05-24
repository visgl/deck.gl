/* global window, document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, COORDINATE_SYSTEM} from 'deck.gl';

import DataFilterExtension from './data-filter-extension';
import POINTS from './data-sample';

import {extendLayer} from '@deck.gl/core';

const dataFilterExtension = new DataFilterExtension({filterSize: 2});

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
    const t = (this.state.time / 4000) % 1;
    const cos = Math.abs(Math.cos(t * Math.PI));
    const sin = Math.abs(Math.sin(t * Math.PI));

    const filterRange = [
      [-cos * 5000, cos * 5000], // x
      [-sin * 5000, sin * 5000] // y
    ];

    return [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.45, 37.78],
        data: POINTS,

        // Data accessors
        getPosition: d => d,
        getFillColor: [0, 180, 255],
        getRadius: 4,
        getFilterValue: d => d,

        // Filter
        filterRange,

        extensions: [dataFilterExtension]
      })
    ];
  }

  render() {
    return (
      <DeckGL
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        layers={this._renderLayers()}
      />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
