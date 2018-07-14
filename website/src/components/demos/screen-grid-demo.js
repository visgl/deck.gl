import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {App} from 'website-examples/screen-grid/app';

const INITIAL_VIEW_STATE = {
  longitude: -73.75,
  latitude: 40.73,
  zoom: 9.6,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export default class ScreenGridDemo extends Component {

  static get data() {
    return {
      url: `${DATA_URI}/screen-grid-data-uber-pickups-nyc.txt`,
      worker: 'workers/screen-grid-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      gpuAggregation: {displayName: 'GPU Accelerated', type: 'checkbox', value: true},
      cellSize: {displayName: 'Cell Size', type: 'range', value: 5, step: 1, min: 1, max: 20}
    };
  }

  static get viewport() {
    return {
      ...INITIAL_VIEW_STATE,
      dragToRotate: false
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Uber Pickup Locations In NewYork City</h3>
        <p>Pickup locations form April to September 2014.</p>
        <p>The layer aggregates data within the boundary of screen grid cells
           and maps the aggregated values to a dynamic color scale</p>
        <p>Data source: <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">Uber TLC FOIL Response</a></p>
        <div className="stat">No. of Samples<b>{ readableInteger(meta.count || 0) }</b></div>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;
    const cellSize = params.cellSize.value;
    const gpuAggregation = params.gpuAggregation.value;

    return (
      <App {...this.props} data={data} cellSize={cellSize} gpuAggregation={gpuAggregation} />
    );
  }
}
