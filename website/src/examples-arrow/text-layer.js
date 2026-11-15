// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'arrow-website-examples/text/app';

import {makeExample} from '../components';

/** Connects the Arrow text example to the website controls. */
class TextDemo extends Component {
  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Title shown above the example controls. */
  static title = 'World Cities by Population';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/geonames.txt`,
    worker: '/workers/geonames-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/text`;

  /** Interactive controls and their initial values. */
  static parameters = {
    noOverlap: {displayName: 'Prevent overlap', type: 'checkbox', value: true},
    fontSize: {displayName: 'Font Size', type: 'range', value: 32, step: 1, min: 20, max: 80}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>World cities with population more than 1000</p>
        <p>
          Data source:
          <a href="https://data.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000%40public/information/?disjunctive.cou_name_en">
            GeoNames
          </a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of cities
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params, data} = this.props;

    return (
      <App
        {...this.props}
        key={this.props.device?.type}
        data={data}
        noOverlap={params.noOverlap.value}
        fontSize={params.fontSize.value}
      />
    );
  }
}

export default makeExample(TextDemo);
