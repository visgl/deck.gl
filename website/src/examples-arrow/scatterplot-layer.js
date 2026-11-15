// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, { Component } from 'react';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import { MAPBOX_STYLES, DATA_URI, GITHUB_TREE } from '../constants/defaults';
import { readableInteger } from '../utils/format-utils';
import App from 'arrow-website-examples/scatterplot/app';

import { makeExample } from '../components';

/** Connects the Arrow scatter plot example to the website controls. */
class ScatterPlotDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Every Person in New York City';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/scatterplot`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/scatterplot-data.txt`,
    worker: '/workers/scatterplot-data-decoder.js'
  };

  /** Interactive controls and their initial values. */
  static parameters = {
    colorM: { displayName: 'Male', type: 'color', value: [0, 128, 255] },
    colorF: { displayName: 'Female', type: 'color', value: [255, 0, 128] },
    radius: { displayName: 'Radius', type: 'range', value: 10, step: 0.1, min: 1, max: 20 }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.LIGHT;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Each dot represents 10 people. Density per tract from 2015 census data</p>
        <p>
          Data source: <a href="http://www.census.gov">US Census Bureau</a>
        </p>
        <div className="stat">
          No. of Instances
          <b>{readableInteger(meta.points || 0)}</b>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const { params, data } = this.props;
    /** Provides widgets for the example. */
    const widgets = [new StatsWidget({type: 'device'})];

    return (
      <App
        key={this.props.device?.type}
        device={this.props.device}
        data={data}
        maleColor={params.colorM.value}
        femaleColor={params.colorF.value}
        radius={params.radius.value}
        widgets={widgets}
      />
    );
  }
}

export default makeExample(ScatterPlotDemo);
