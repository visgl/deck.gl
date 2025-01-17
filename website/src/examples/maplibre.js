// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/maplibre/app';

import {makeExample} from '../components';

class MapLibreDemo extends React.Component {
  static title = 'MapLibre Integration';

  static code = `${GITHUB_TREE}/examples/website/maplibre`;

  static parameters = {
    interleaveLabels: {displayName: 'Interleaved Labels', type: 'checkbox', value: true}
  };

  static data = {
    url: `${DATA_URI}/air-traffic.txt`,
    worker: '/workers/air-traffic-decoder.js'
  };

  static renderInfo() {
    return (
      <div>
        <p>The development of air traffic on selected dates between Feburary and October, 2020.</p>
        <p>
          Interleaved integration with MapLibre GL JS using the globe projection.
        </p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="http://www.opensky-network.org"> The OpenSky Network</a>
        </p>
      </div>
    );
  }

  render() {
    const {params} = this.props;
    return <App {...this.props} interleaveLabels={params.interleaveLabels.value} />;
  }
}

export default makeExample(MapLibreDemo); 