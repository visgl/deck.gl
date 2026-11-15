// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/maplibre/app';

import {makeExample} from '../components';

/** Connects the Arrow map libre example to the website controls. */
class MapLibreDemo extends React.Component {
  /** Title shown above the example controls. */
  static title = 'MapLibre Integration';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/maplibre`;

  /** Interactive controls and their initial values. */
  static parameters = {
    interleaveLabels: {displayName: 'Interleaved Labels', type: 'checkbox', value: true}
  };

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/air-traffic.txt`,
    worker: '/workers/air-traffic-decoder.js'
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo() {
    return (
      <div>
        <p>The development of air traffic on selected dates between Feburary and October, 2020.</p>
        <p>
          Interleaved integration with MapLibre GL JS using the globe projection.
        </p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="https://opensky-network.org"> The OpenSky Network</a>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params for the example. */
    const {params} = this.props;
    return <App {...this.props} interleaveLabels={params.interleaveLabels.value} />;
  }
}

export default makeExample(MapLibreDemo); 