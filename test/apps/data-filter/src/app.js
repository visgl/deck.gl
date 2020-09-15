/* global window, document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';

import DATA from './data-sample';

const dataFilterExtension = new DataFilterExtension({
  filterSize: 2,
  softMargin: true,
  countItems: true
});

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
    const filterSoftRange = [
      [-cos * 5000 + 1000, cos * 5000 - 1000], // x
      [-sin * 5000 + 1000, sin * 5000 - 1000] // y
    ];

    return [
      new GeoJsonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.45, 37.78],
        data: DATA,

        // Data accessors
        getFillColor: f => f.properties.color,
        getLineWidth: 10,
        getRadius: f => f.properties.radius,
        getFilterValue: f => f.properties.centroid,

        onFilteredItemsChange: console.log, // eslint-disable-line

        // Filter
        filterRange,
        filterSoftRange,

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
