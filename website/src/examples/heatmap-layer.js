import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/heatmap/app';

import {makeExample} from '../components';

class HeatmapDemo extends Component {
  static title = 'Uber Pickup Locations In NewYork City';

  static data = {
    url: `${DATA_URI}/screen-grid-data-uber-pickups-nyc.txt`,
    worker: '/workers/screen-grid-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/heatmap`;

  static parameters = {
    radius: {displayName: 'Radius', type: 'range', value: 5, step: 1, min: 1, max: 50},
    intensity: {displayName: 'Intensity', type: 'range', value: 1, step: 0.1, min: 0, max: 5},
    threshold: {displayName: 'Threshold', type: 'range', value: 0.03, step: 0.01, min: 0, max: 1}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Pickup locations form April to September 2014.</p>
        <div>
          <img
            src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"
            alt="color scale"
            style={{height: 8, width: '100%'}}
          />
        </div>
        <p className="layout">
          <span className="col-1-2">Fewer</span>
          <span className="col-1-2 text-right">More</span>
        </p>
        <p>
          Data source:{' '}
          <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">
            Uber TLC FOIL Response
          </a>
        </p>
        <div className="stat">
          No. of Samples
          <b>{readableInteger(meta.count || 0)}</b>
        </div>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;
    const radiusPixels = params.radius.value;
    const intensity = params.intensity.value;
    const threshold = params.threshold.value;

    return (
      <App
        {...this.props}
        data={data}
        intensity={intensity}
        threshold={threshold}
        radiusPixels={radiusPixels}
      />
    );
  }
}

export default makeExample(HeatmapDemo);
