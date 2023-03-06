import React, {Component} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/globe/app';

import {makeExample} from '../components';

class MultiViewDemo extends Component {
  static title = 'Air Traffic During the Global Pandemic';

  static data = {
    url: `${DATA_URI}/air-traffic.txt`,
    worker: '/workers/air-traffic-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/globe`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>The development of air traffic on selected dates between Feburary and October, 2020.</p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="http://www.opensky-network.org"> The OpenSky Network</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Flights
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%', position: 'absolute', background: '#111'}}>
        <App {...this.props} />
      </div>
    );
  }
}

export default makeExample(MultiViewDemo);
