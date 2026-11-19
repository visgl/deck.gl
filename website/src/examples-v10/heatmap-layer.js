// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/heatmap/app';

import {makeExample} from '../components';

/** Connects the Arrow heatmap example to the website controls. */
class HeatmapDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Uber Pickup Locations In NewYork City';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/heatmap`;

  /** Interactive controls and their initial values. */
  static parameters = {
    radius: {displayName: 'Radius', type: 'range', value: 5, step: 1, min: 1, max: 50},
    intensity: {displayName: 'Intensity', type: 'range', value: 1, step: 0.1, min: 0, max: 5},
    threshold: {displayName: 'Threshold', type: 'range', value: 0.03, step: 0.01, min: 0, max: 1}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
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

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params} = this.props;
    /** Provides radius pixels for the example. */
    const radiusPixels = params.radius.value;
    /** Provides intensity for the example. */
    const intensity = params.intensity.value;
    /** Provides threshold for the example. */
    const threshold = params.threshold.value;

    return (
      <App
        mapStyle={this.props.mapStyle}
        device={this.props.device}
        onDataLoad={count => this.props.onStateChange({count})}
        intensity={intensity}
        threshold={threshold}
        radiusPixels={radiusPixels}
      />
    );
  }
}

export default makeExample(HeatmapDemo);
