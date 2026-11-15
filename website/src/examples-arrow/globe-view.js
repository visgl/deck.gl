// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'arrow-website-examples/globe/app';

import {makeExample} from '../components';

/** Connects the Arrow multi view example to the website controls. */
class MultiViewDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Air Traffic During the Global Pandemic';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/air-traffic.txt`,
    worker: '/workers/air-traffic-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/globe`;

  /** Interactive controls and their initial values. */
  static parameters = {};

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>The development of air traffic on selected dates between Feburary and October, 2020.</p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="https://opensky-network.org"> The OpenSky Network</a>
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

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    return (
      <div style={{width: '100%', height: '100%', position: 'absolute', background: '#111'}}>
        <App {...this.props} />
      </div>
    );
  }
}

export default makeExample(MultiViewDemo);
