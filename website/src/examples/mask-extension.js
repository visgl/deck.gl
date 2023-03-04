import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/mask-extension/app';

import {makeExample} from '../components';

class MaskExtensionDemo extends Component {
  static title = 'Flights over cities';

  static data = {
    url: `${DATA_URI}/air-traffic-sm.txt`,
    worker: '/workers/air-traffic-sm-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/mask-extension`;

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

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Global flights, highlighting cities where a plane passed overhead in the last N mins</p>
        <p>
          Data source: <a href="https://zenodo.org/record/3974209">Crowdsourced air traffic data</a>{' '}
          from <a href="http://www.opensky-network.org"> The OpenSky Network</a>
        </p>
      </div>
    );
  }

  render() {
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
