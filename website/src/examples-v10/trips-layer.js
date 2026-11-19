// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';

import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'v10-website-examples/trips/app';

import {makeExample} from '../components';

/** Connects the Arrow trips example to the website controls. */
class TripsDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Yellow Cab Vs. Green Cab Trips in Manhattan';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Buildings retain the website's full dataset. The app loads trips. */
  static data = {
    url: `${DATA_URI}/building-data.txt`,
    worker: '/workers/building-data-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/trips`;

  /** Interactive controls and their initial values. */
  static parameters = {
    trail: {displayName: 'Trail', type: 'range', value: 180, step: 1, min: 10, max: 200}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Trips are taken from June 16, 2016 21:00 to 21:30</p>
        <p>
          Trip data source:&nbsp;
          <a href="http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml">
            NYC Taxi & Limousine Commission Trip Records
          </a>
        </p>
        <p>
          Building data source:&nbsp;
          <a href="http://openstreetmap.org">OpenStreetMap</a> via&nbsp;
          <a href="https://mapzen.com/">Mapzen Vector Tiles API</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            Rendered Trips
            <b>{readableInteger(meta.trips || 0)}</b>
          </div>
          <div className="stat col-1-2">
            No. of Buildings
            <b>{readableInteger(meta.buildings || 0)}</b>
          </div>
        </div>
        <div className="layout">
          <div className="stat col-1-2">
            Vertices
            <b>{readableInteger((meta.vertices || 0) + (meta.triangles || 0) * 3)}</b>
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
        key={this.props.device?.type}
        buildings={data}
        onDataLoad={this.props.onStateChange}
        animationSpeed={1}
        trailLength={params.trail.value}
      />
    );
  }
}

export default makeExample(TripsDemo);
