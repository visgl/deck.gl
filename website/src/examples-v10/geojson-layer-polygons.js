// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLOR_SCALE} from 'v10-website-examples/geojson/app';

import {makeExample} from '../components';

/** Connects the Arrow geo json example to the website controls. */
class GeoJsonDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Vancouver Property Value';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/geojson`;

  /** Interactive controls and their initial values. */
  static parameters = {};

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.LIGHT;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    /** Provides legends for the example. */
    const legends = COLOR_SCALE.domain();
    /** Provides width for the example. */
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <p>The property value of Vancouver, BC</p>
        <p>
          Height of polygons - average property value per square meter of lot
          <br />
          Color - value growth from last assessment
        </p>
        <div className="layout">
          {legends.map((l, i) => (
            <div
              key={i}
              className="legend"
              style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
            />
          ))}
        </div>
        <div className="layout">
          {legends.map(
            (l, i) =>
              i % 2 === 0 && (
                <div key={i} style={{width}}>
                  {Math.round(l * 100)}%
                </div>
              )
          )}
        </div>
        <p>
          Data source:&nbsp;
          <a href="http://data.vancouver.ca/">City of Vancouver</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Polygons<b>{readableInteger(meta.count) || 0}</b>
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
    const {data, ...otherProps} = this.props;
    return <App {...otherProps} onDataLoad={stats => this.props.onStateChange(stats)} />;
  }
}

export default makeExample(GeoJsonDemo);
