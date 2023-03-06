import React, {Component} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {colorScale} from 'website-examples/ghcn/app';
import {readableInteger} from '../utils/format-utils';

import {makeExample} from '../components';

class OrthographicViewDemo extends Component {
  static title = 'World Weather Station Temperatures, 1880-2020';

  static data = {
    url: `${DATA_URI}/ghcn-annual.txt`,
    worker: '/workers/ghcn-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/ghcn`;

  static parameters = {
    groupBy: {
      displayName: 'Group By',
      type: 'select',
      options: ['Country', 'Latitude'],
      value: 'Country'
    }
  };

  static renderInfo(meta) {
    const buckets = [-60, -45, -30, -15, 0, 15, 30];

    return (
      <div>
        <p>
          Annual average temperature recorded by the Global Historical Climatology Network,
          homogenized.
        </p>
        <div className="layout">
          {buckets.map((x, i) => (
            <div
              className="legend"
              key={i}
              style={{
                background: `rgb(${colorScale(x).join(',')})`,
                width: `${100 / buckets.length}%`
              }}
            />
          ))}
        </div>
        <p className="layout">
          {buckets.map((x, i) => (
            <div key={i} className="text-center" style={{width: `${100 / buckets.length}%`}}>
              {x}
            </div>
          ))}
        </p>
        <p>
          Data source:{' '}
          <a href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-monthly-version-4">
            NOAA GHCNm v4
          </a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            Stations
            <b>{readableInteger(meta.stations || 0)}</b>
          </div>
          <div className="stat col-1-2">
            Data points
            <b>{readableInteger(meta.vertices || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;
    const groupBy = params.groupBy.value;

    return (
      <div style={{width: '100%', height: '100%', background: '#222'}}>
        <App {...otherProps} data={data} groupBy={groupBy} />
      </div>
    );
  }
}

export default makeExample(OrthographicViewDemo);
