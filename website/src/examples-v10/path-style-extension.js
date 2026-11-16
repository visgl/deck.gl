// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE, MAPBOX_STYLES} from '../constants/defaults';
import App, {ROAD_STYLE} from 'v10-website-examples/path-style-extension/app';

import {makeExample} from '../components';

/** Provides legend for the example. */
const LEGEND = [
  {label: 'White marking', color: ROAD_STYLE.whiteMarking},
  {label: 'Yellow marking', color: ROAD_STYLE.yellowMarking},
  {label: 'Bicycle crossing', color: ROAD_STYLE.bikePanel},
  {label: 'Vehicle lane', color: ROAD_STYLE.vehicleLane}
];

// Blends a color over asphalt so that the swatch matches the map
function getSwatchColor([r, g, b, a = 255]) {
  /** Provides alpha for the example. */
  const alpha = a / 255;
  /** Provides channels for the example. */
  const channels = [r, g, b].map((value, i) =>
    Math.round(value * alpha + ROAD_STYLE.asphalt[i] * (1 - alpha))
  );
  return `rgb(${channels.join(',')})`;
}

/** Connects the Arrow path style extension example to the website controls. */
class PathStyleExtensionDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Street Design Anatomy';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/path-style-extension`;

  /** Interactive controls and their initial values. */
  static parameters = {
    units: {
      displayName: 'Units',
      type: 'select',
      options: ['Meters', 'Pixels'],
      value: 'Meters'
    },
    dashScale: {
      displayName: 'Dash scale',
      type: 'range',
      value: 1,
      step: 0.25,
      min: 0.5,
      max: 2
    },
    extensionLayersOnly: {displayName: 'Extension layers only', type: 'checkbox', value: false}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo() {
    return (
      <div>
        <p>Seattle road-design data at Dexter Avenue N and Thomas Street.</p>
        <p>
          Crosswalks, bike crossings and lane lines are dashed paths. Lanes and double yellow lines
          are offset copies of one path.
        </p>
        {LEGEND.map(({label, color}) => (
          <p key={label}>
            <span
              className="legend"
              style={{
                background: getSwatchColor(color),
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.4)'
              }}
            />{' '}
            {label}
          </p>
        ))}
        <p>
          <b>Units</b>
          <br />
          Meters keep the size painted on the road. Pixels keep dashes the same size on screen.
        </p>
        <p>Click a marking to see its dash settings and source records.</p>
        <p>
          Data source:{' '}
          <a href="https://data-seattlecitygis.opendata.arcgis.com/">
            City of Seattle Department of Transportation
          </a>
          , used under <a href="https://opendatacommons.org/licenses/pddl/1-0/">PDDL 1.0</a>.
        </p>
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
        measurementMode={params.units.value === 'Meters' ? 'physical' : 'screen'}
        dashScale={params.dashScale.value}
        extensionLayersOnly={params.extensionLayersOnly.value}
      />
    );
  }
}

export default makeExample(PathStyleExtensionDemo);
