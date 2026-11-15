// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import App, {colorRange} from 'v10-website-examples/3d-heatmap/app';

import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';

import {makeExample} from '../components';

/** Connects the Arrow hexagon example to the website controls. */
class HexagonDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'United Kingdom Road Safety';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/3d-heatmap`;

  /** Interactive controls and their initial values. */
  static parameters = {
    radius: {displayName: 'Radius', type: 'range', value: 2000, step: 100, min: 500, max: 20000},
    coverage: {displayName: 'Coverage', type: 'range', value: 0.7, step: 0.1, min: 0, max: 1},
    upperPercentile: {
      displayName: 'Upper Percentile',
      type: 'range',
      value: 100,
      step: 0.1,
      min: 80,
      max: 100
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    /** Provides color ramp for the example. */
    const colorRamp = colorRange.slice().map(color => `rgb(${color.join(',')})`);

    return (
      <div>
        <p>Personal injury road accidents in GB from 1979</p>
        <p>The layer aggregates data within the boundary of each hexagon cell</p>

        <div className="layout">
          {colorRamp.map((c, i) => (
            <div
              key={i}
              className="legend"
              style={{background: c, width: `${100 / colorRamp.length}%`}}
            />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Fewer Accidents</span>
          <span className="col-1-2 text-right">More Accidents</span>
        </p>

        <p>
          Data source: <a href="https://data.gov.uk">DATA.GOV.UK</a>
        </p>

        <div className="layout">
          <div className="stat col-1-2">
            Accidents
            <b>{readableInteger(meta.count) || 0}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    const {params, onStateChange} = this.props;

    return (
      <App
        {...this.props}
        key={this.props.device?.type}
        device={this.props.device}
        onDataLoad={count => onStateChange({count})}
        radius={params.radius.value}
        upperPercentile={params.upperPercentile.value}
        coverage={params.coverage.value}
      />
    );
  }
}

export default makeExample(HexagonDemo);
