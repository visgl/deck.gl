import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import App, {colorRange} from 'website-examples/3d-heatmap/app';

import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';

import {makeExample} from '../components';

class HexagonDemo extends Component {
  static title = 'United Kingdom Road Safety';

  static data = {
    url: `${DATA_URI}/heatmap-data.txt`,
    worker: '/workers/heatmap-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/3d-heatmap`;

  static parameters = {
    radius: {displayName: 'Radius', type: 'range', value: 2000, step: 100, min: 500, max: 20000},
    coverage: {displayName: 'Coverage', type: 'range', value: 0.7, step: 0.1, min: 0, max: 1},
    upperPercentile: {
      displayName: 'Upper Percentile',
      type: 'range',
      value: 100,
      step: 0.1,
      min: 80,
      max: 100
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    const colorRamp = colorRange.slice().map(color => `rgb(${color.join(',')})`);

    return (
      <div>
        <p>Personal injury road accidents in GB from 1979</p>
        <p>The layer aggregates data within the boundary of each hexagon cell</p>

        <div className="layout">
          {colorRamp.map((c, i) => (
            <div
              key={i}
              className="legend"
              style={{background: c, width: `${100 / colorRamp.length}%`}}
            />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Fewer Accidents</span>
          <span className="col-1-2 text-right">More Accidents</span>
        </p>

        <p>
          Data source: <a href="https://data.gov.uk">DATA.GOV.UK</a>
        </p>

        <div className="layout">
          <div className="stat col-1-2">
            Accidents
            <b>{readableInteger(meta.count) || 0}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {data, params} = this.props;

    return (
      <App
        {...this.props}
        data={data}
        radius={params.radius.value}
        upperPercentile={params.upperPercentile.value}
        coverage={params.coverage.value}
      />
    );
  }
}

export default makeExample(HexagonDemo);
