// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/global-grids/app';
import {LANDCOVER_LEGEND} from 'v10-website-examples/global-grids/landcover-palette';

import {makeExample} from '../components';

/** Provides grid systems for the example. */
const GRID_SYSTEMS = ['a5', 'geohash', 'h3', 's2', 'quadkey'];

/** Connects the Arrow global grids example to the website controls. */
class GlobalGridsDemo extends React.Component {
  /** Title shown above the example controls. */
  static title = 'Global Grid Layers';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/global-grids`;

  /** Interactive controls and their initial values. */
  static parameters = {
    gridSystem: {
      displayName: 'Grid System',
      type: 'select',
      options: GRID_SYSTEMS,
      value: GRID_SYSTEMS[Math.floor(Math.random() * GRID_SYSTEMS.length)]
    },
    landcoverLegend: {
      displayName: 'Landcover Classification',
      type: 'legend',
      value: LANDCOVER_LEGEND,
      altValue: LANDCOVER_LEGEND
    }
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo() {
    return (
      <div>
        <p>
          <a href="https://neo.gsfc.nasa.gov/view.php?datasetId=MCD12C1_T1">NASA Land Cover data</a>
          , aggregated using <a href="https://github.com/manaakiwhenua/raster2dggs">raster2dggs</a>{' '}
          to various global grid systems.
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params for the example. */
    const {params} = this.props;
    return (
      <App
        key={this.props.device?.type}
        {...this.props}
        gridSystem={params.gridSystem.value}
        landcoverLegend={params.landcoverLegend.value}
      />
    );
  }
}

export default makeExample(GlobalGridsDemo);
