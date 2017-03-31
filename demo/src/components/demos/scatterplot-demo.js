import React, {Component} from 'react';
import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import ScatterplotOverlay from '../../../../examples/scatterplot/deckgl-overlay';

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
      radius: {displayName: 'Radius', type: 'range', value: 10, step: 1, min: 1, max: 40}
    };
  }

  static get viewport() {
    return {
      ...ScatterplotOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.LIGHT
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Every Person in New York City</h3>
        <p>Each dot represents 10 people. Density per tract from 2015 census data</p>
        <p>Data source: <a href="http://www.census.gov">US Census Bureau</a></p>
        <div className="stat">No. of Instances
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

    return (
      <ScatterplotOverlay viewport={viewport}
        data={data}
        maleColor={params.colorM.value}
        femaleColor={params.colorF.value}
        radius={params.radius.value} />
    );
  }
}
