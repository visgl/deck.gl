// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/mask-extension/app';

import {makeExample} from '../components';

/** Connects the Arrow mask extension example to the website controls. */
class MaskExtensionDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Flights over cities';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/air-traffic-sm.txt`,
    worker: '/workers/air-traffic-sm-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/mask-extension`;

  /** Interactive controls and their initial values. */
  static parameters = {
    showFlights: {displayName: 'Show flights', type: 'checkbox', value: true},
    timeWindow: {
      displayName: 'Minutes since flight',
      type: 'range',
      value: 30,
      step: 5,
      min: 5,
      max: 300
    },
    animationSpeed: {
      displayName: 'Animation speed',
      type: 'range',
      value: 3,
      step: 1,
      min: 1,
      max: 100
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Global flights, highlighting cities where a plane passed overhead in the last N mins</p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="https://opensky-network.org"> The OpenSky Network</a>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides data, params, ...other props for the example. */
    const {data, params, ...otherProps} = this.props;

    // renders the mask extension demo app wrapped in necessary BaseUI and Styletron providers
    return (
      <App
        data={data}
        {...otherProps}
        showFlights={params.showFlights.value}
        timeWindow={params.timeWindow.value}
        animationSpeed={params.animationSpeed.value}
      />
    );
  }
}

export default makeExample(MaskExtensionDemo);
