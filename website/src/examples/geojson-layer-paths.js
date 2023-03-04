import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {COLOR_SCALE} from 'website-examples/highway/app';

import {makeExample} from '../components';

class HighwayDemo extends Component {
  static title = 'Highway Safety in the US';

  static data = [
    {
      url: `${DATA_URI}/highway-accidents.txt`,
      worker: '/workers/highway-accidents-decoder.js'
    },
    {
      url: `${DATA_URI}/highway-roads.txt`,
      worker: '/workers/highway-roads-decoder.js'
    }
  ];

  static code = `${GITHUB_TREE}/examples/website/highway`;

  static parameters = {
    year: {displayName: 'Year', type: 'range', value: 1990, step: 5, min: 1990, max: 2015}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    const legends = COLOR_SCALE.domain();
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <p>
          Fatal accidents on U.S. highways
          <br />
          (1990 - 2015)
        </p>
        <p>Fatalities per 1,000 miles:</p>
        <div className="layout">
          {legends.map((l, i) => (
            <div
              key={i}
              className="legend"
              style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
            />
          ))}
        </div>
        <p className="layout">
          {legends.slice(0, -1).map((l, i) => (
            <span key={i} style={{width}}>
              {l}
            </span>
          ))}
        </p>
        <p>
          Data source:
          <br />
          <a href="https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars">
            National Highway Traffic Safty Administration
          </a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Paths<b>{readableInteger(meta.count) || 0}</b>
          </div>
          <div className="stat col-1-2">
            No. of Vertices<b>{readableInteger(meta.vertexCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {data, params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        year={params.year.value}
        accidents={data && data[0]}
        roads={data && data[1]}
      />
    );
  }
}

export default makeExample(HighwayDemo);
