import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer} from 'deck.gl';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';

export default class ScatterPlotDemo extends Component {

  static get data() {
    return {
      url: 'data/scatterplot-data.txt',
      worker: 'workers/scatterplot-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      colorM: {displayName: 'Male', type: 'color', value: [0, 128, 255]},
      colorF: {displayName: 'Female', type: 'color', value: [255, 0, 128]},
      radius: {displayName: 'Radius', type: 'number', value: 10, step: 1, min: 1}
    };
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.LIGHT,
      longitude: -74,
      latitude: 40.7,
      zoom: 11,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Every Person in New York City</h3>
        <p>Each dot accounts for 10 people. Density per tract from 2015 census data.</p>
        <p>Data source: <a href="http://www.census.gov">US Census Bureau</a></p>
        <div className="stat">Instances
          <b>{ readableInteger(meta.points || 0) }</b>
        </div>
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      data,
      radiusScale: params.radius.value,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => d[2] === 1 ? params.colorM.value : params.colorF.value,
      getRadius: d => 1,
      updateTriggers: {
        getColor: {c1: params.colorM.value, c2: params.colorF.value}
      }
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}
