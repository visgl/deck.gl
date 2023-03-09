import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/scatterplot/app';

import {makeExample} from '../components';

class ScatterPlotDemo extends Component {
  static title = 'Every Person in New York City';

  static code = `${GITHUB_TREE}/examples/website/scatterplot`;

  static data = {
    url: `${DATA_URI}/scatterplot-data.txt`,
    worker: '/workers/scatterplot-data-decoder.js'
  };

  static parameters = {
    colorM: {displayName: 'Male', type: 'color', value: [0, 128, 255]},
    colorF: {displayName: 'Female', type: 'color', value: [255, 0, 128]},
    radius: {displayName: 'Radius', type: 'range', value: 10, step: 0.1, min: 1, max: 20}
  };

  static mapStyle = MAPBOX_STYLES.LIGHT;

  static renderInfo(meta) {
    return (
      <div>
        <p>Each dot represents 10 people. Density per tract from 2015 census data</p>
        <p>
          Data source: <a href="http://www.census.gov">US Census Bureau</a>
        </p>
        <div className="stat">
          No. of Instances
          <b>{readableInteger(meta.points || 0)}</b>
        </div>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;

    return (
      <App
        {...this.props}
        data={data}
        maleColor={params.colorM.value}
        femaleColor={params.colorF.value}
        radius={params.radius.value}
      />
    );
  }
}

export default makeExample(ScatterPlotDemo);
