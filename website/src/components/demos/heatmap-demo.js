import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {App} from 'website-examples/heatmap/app';

export default class HeatmapDemo extends Component {
  static get data() {
    return {
      url: `${DATA_URI}/screen-grid-data-uber-pickups-nyc.txt`,
      worker: 'workers/screen-grid-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      radius: {displayName: 'Radius', type: 'range', value: 5, step: 1, min: 1, max: 50},
      intensity: {displayName: 'Intensity', type: 'range', value: 1, step: 0.1, min: 0, max: 5},
      threshold: {displayName: 'Threshold', type: 'range', value: 0.03, step: 0.01, min: 0, max: 1}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Uber Pickup Locations In NewYork City</h3>
        <p>Pickup locations form April to September 2014.</p>
        <div>
          <img src="./images/colorbrewer_YlOrRd_6.png" style={{height: 8, width: '100%'}} />
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
