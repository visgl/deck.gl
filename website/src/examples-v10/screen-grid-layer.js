// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/screen-grid/app';

import {makeExample} from '../components';

/** Connects the Arrow screen grid example to the website controls. */
class ScreenGridDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Uber Pickup Locations In NewYork City';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/screen-grid`;

  /** Interactive controls and their initial values. */
  static parameters = {
    gpuAggregation: {displayName: 'GPU Acceleration', type: 'checkbox', value: true},
    cellSize: {displayName: 'Cell Size', type: 'range', value: 5, step: 1, min: 1, max: 20}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Pickup locations form April to September 2014.</p>
        <p>
          The layer aggregates data within the boundary of screen grid cells and maps the aggregated
          values to a dynamic color scale
        </p>
        <p>
          Data source:{' '}
          <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">
            Uber TLC FOIL Response
          </a>
        </p>
        <div className="stat">
          No. of Samples<b>{readableInteger(meta.count || 0)}</b>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params} = this.props;
    /** Provides cell size for the example. */
    const cellSize = params.cellSize.value;
    /** Provides gpu aggregation for the example. */
    const gpuAggregation = params.gpuAggregation.value;

    return (
      <App
        mapStyle={this.props.mapStyle}
        onDataLoad={count => this.props.onStateChange({count})}
        key={this.props.device?.type}
        device={this.props.device}
        cellSize={cellSize}
        gpuAggregation={gpuAggregation}
      />
    );
  }
}

export default makeExample(ScreenGridDemo);
