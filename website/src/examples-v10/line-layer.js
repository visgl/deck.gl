// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {_LegendWidget, _StatsWidget as StatsWidget} from '@deck.gl/widgets';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/line/app';

import {makeExample} from '../components';

/** Connects the Arrow line example to the website controls. */
class LineDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Flights To And From London Heathrow Airport';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/line`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Interactive controls and their initial values. */
  static parameters = {
    width: {
      displayName: 'Width',
      type: 'range',
      value: 3,
      step: 0.1,
      min: 0,
      max: 10
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Flight paths in a 6-hour window</p>
        <p>From 08:32:43 GMT to 14:32:43 GMT on March 28th, 2017</p>
        <p>
          Flight path data source:
          <a href="https://opensky-network.org/"> The OpenSky Network</a>
          <br />
          Airport location data source:
          <a href="http://www.naturalearthdata.com/"> Natural Earth</a>
        </p>
        <div className="stat">
          No. of Line Segments<b>{readableInteger(meta.count || 0)}</b>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data, ...other props for the example. */
    const {params, onStateChange, ...otherProps} = this.props;
    /** Provides widgets for the example. */
    const widgets = [
      new StatsWidget({type: 'device'}),
      new _LegendWidget({label: 'Flight altitude', placement: 'bottom-right'})
    ];

    return (
      <App
        {...otherProps}
        key={this.props.device?.type}
        device={this.props.device}
        airports={`${DATA_URI}/airports.json`}
        onDataLoad={count => onStateChange({count})}
        lineWidth={params.width.value}
        widgets={widgets}
      />
    );
  }
}

export default makeExample(LineDemo);
