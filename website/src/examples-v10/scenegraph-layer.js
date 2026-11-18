// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'v10-website-examples/scenegraph/app';

import {makeExample} from '../components';

/** Connects the Arrow scenegraph example to the website controls. */
class ScenegraphDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Flight Tracker';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/scenegraph`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Interactive controls and their initial values. */
  static parameters = {
    sizeScale: {displayName: 'Size', type: 'range', value: 25, step: 5, min: 5, max: 500}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          Flight data:
          <a href="https://opensky-network.org">The OpenSky Network</a>
        </p>
        <p>{meta.source === 'live' ? 'Live positions' : 'Simulated fallback replay'}</p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Planes
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, ...other props for the example. */
    const {params, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        key={this.props.device?.type}
        sizeScale={params.sizeScale.value}
        onDataLoad={count => this.props.onStateChange({count})}
        onDataSource={source => this.props.onStateChange({source})}
      />
    );
  }
}

export default makeExample(ScenegraphDemo);
