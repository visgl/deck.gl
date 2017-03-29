import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';
import LineOverlay from '../../../../examples/line/deckgl-overlay';

export default class LineDemo extends Component {

  static get data() {
    return {
      url: 'data/flight-path-data.txt',
      worker: 'workers/flight-path-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      strokeWidth: {displayName: 'Stroke Width', type: 'number', value: 3, step: 1, min: 1}
    };
  }

  static get viewport() {
    return {
      ...LineOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Flights In And Out Of Heathrow Airport</h3>
        <p>Flight paths from a 4 hour window on March 28th, 2017</p>
        <p>Data source: <a href="https://opensky-network.org/">OpenSky Network</a></p>
        <div className="stat">Segments<b>{ readableInteger(meta.count || 0) }</b></div>
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    return (
      <LineOverlay viewport={viewport} data={data} strokeWidth={params.strokeWidth.value} />
    );
  }
}
