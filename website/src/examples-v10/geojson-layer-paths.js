// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLOR_SCALE} from 'v10-website-examples/highway/app';

import {makeExample} from '../components';

/** Connects the Arrow highway example to the website controls. */
class HighwayDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Highway Safety in the US';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/highway`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Interactive controls and their initial values. */
  static parameters = {
    year: {displayName: 'Year', type: 'range', value: 1990, step: 5, min: 1990, max: 2015}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    /** Provides legends for the example. */
    const legends = COLOR_SCALE.domain();
    /** Provides width for the example. */
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <p>
          Fatal accidents on U.S. highways
          <br />
          (1990 - 2015)
        </p>
        <p>Fatalities per 1,000 miles:</p>
        <div className="layout">
          {legends.map((l, i) => (
            <div
              key={i}
              className="legend"
              style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
            />
          ))}
        </div>
        <p className="layout">
          {legends.slice(0, -1).map((l, i) => (
            <span key={i} style={{width}}>
              {l}
            </span>
          ))}
        </p>
        <p>
          Data source:
          <br />
          <a href="https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars">
            National Highway Traffic Safty Administration
          </a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Paths<b>{readableInteger(meta.count) || 0}</b>
          </div>
          <div className="stat col-1-2">
            No. of Vertices<b>{readableInteger(meta.vertexCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides data, params, ...other props for the example. */
    const {data, params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        year={params.year.value}
        onDataLoad={stats => this.props.onStateChange(stats)}
      />
    );
  }
}

export default makeExample(HighwayDemo);
