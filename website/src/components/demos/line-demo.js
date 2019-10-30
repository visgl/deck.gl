import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import App from 'website-examples/line/app';

const EMPTY_ARRAY = [];

export default class LineDemo extends Component {
  static get data() {
    return [
      {
        url: `${DATA_URI}/flight-path-data.txt`,
        worker: 'workers/flight-path-data-decoder.js'
      },
      {
        url: `${DATA_URI}/airports.json`
      }
    ];
  }

  static get parameters() {
    return {
      width: {
        displayName: 'Width',
        type: 'range',
        value: 3,
        step: 0.1,
        min: 0,
        max: 10
      }
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Flights To And From London Heathrow Airport</h3>
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

  render() {
    const {params, data, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        flightPaths={(data && data[0]) || EMPTY_ARRAY}
        airports={(data && data[1]) || EMPTY_ARRAY}
        getWidth={params.width.value}
      />
    );
  }
}
