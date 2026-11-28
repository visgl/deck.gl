// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {colorScale} from 'v10-website-examples/orthographic/app';
import {readableInteger} from '../utils/format-utils';

import {makeExample} from '../components';

/** Connects the Arrow orthographic view example to the website controls. */
class OrthographicViewDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'World Weather Station Temperatures, 1880-2020';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/ghcn-annual.txt`,
    worker: '/workers/ghcn-data-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/orthographic`;

  /** Interactive controls and their initial values. */
  static parameters = {
    groupBy: {
      displayName: 'Group By',
      type: 'select',
      options: ['Country', 'Latitude'],
      value: 'Country'
    }
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    /** Provides buckets for the example. */
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

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data, ...other props for the example. */
    const {params, data, ...otherProps} = this.props;
    /** Provides group by for the example. */
    const groupBy = params.groupBy.value;

    return (
      <div style={{width: '100%', height: '100%', background: '#222'}}>
        <App {...otherProps} data={data} groupBy={groupBy} />
      </div>
    );
  }
}

export default makeExample(OrthographicViewDemo);
