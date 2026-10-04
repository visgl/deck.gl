// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE, MAPBOX_STYLES} from '../constants/defaults';
import App, {ROAD_STYLE} from 'website-examples/path-style-extension/app';

import {makeExample} from '../components';

function LegendItem({label, color, children}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '7px 0'}}>
      <span
        style={{
          width: 44,
          height: 6,
          flex: '0 0 auto',
          borderRadius: 2,
          background: color
        }}
      />
      <span>
        {label}
        {children}
      </span>
    </div>
  );
}

class PathStyleExtensionDemo extends Component {
  static title = 'Street Design Anatomy';

  static code = `${GITHUB_TREE}/examples/website/path-style-extension`;

  static parameters = {
    measurement: {
      displayName: 'Measurement',
      type: 'select',
      options: ['Physical', 'Screen'],
      value: 'Physical'
    },
    dashScale: {
      displayName: 'Dash scale',
      type: 'range',
      value: 1,
      step: 0.25,
      min: 0.5,
      max: 2
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo() {
    return (
      <div>
        <p>
          Explore real Seattle road-design data at Dexter Avenue N and Thomas Street.
        </p>
        <div style={{margin: '18px 0'}}>
          <LegendItem label="White road marking" color={`rgb(${ROAD_STYLE.whiteMarking.slice(0, 3)})`} />
          <LegendItem label="Yellow center marking" color={`rgb(${ROAD_STYLE.yellowMarking.slice(0, 3)})`} />
          <LegendItem label="Bicycle panel" color={`rgb(${ROAD_STYLE.bikePanel.slice(0, 3)})`} />
        </div>
        <p>Click a road asset for details.</p>
        <p>
          Data source:{' '}
          <a href="https://data-seattlecitygis.opendata.arcgis.com/">City of Seattle Department of Transportation</a>,
          {' '}used under{' '}
          <a href="https://opendatacommons.org/licenses/pddl/1-0/">PDDL 1.0</a>.
        </p>
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        measurementMode={params.measurement.value === 'Physical' ? 'physical' : 'screen'}
        dashScale={params.dashScale.value}
      />
    );
  }
}

export default makeExample(PathStyleExtensionDemo);
