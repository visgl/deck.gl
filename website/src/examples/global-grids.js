// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/global-grids/app';
import {LANDCOVER_LEGEND} from 'website-examples/global-grids/landcover-palette';

import {makeExample} from '../components';

const GRID_SYSTEMS = ['a5', 'geohash', 'h3', 's2', 'quadkey'];

class GlobalGridsDemo extends React.Component {
  static title = 'Global Grid Layers';

  static code = `${GITHUB_TREE}/examples/website/global-grids`;

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

  static renderInfo() {
    return (
      <div>
        <p><a href="https://neo.gsfc.nasa.gov/view.php?datasetId=MCD12C1_T1">NASA Land Cover data</a>, aggregated using <a href="https://github.com/manaakiwhenua/raster2dggs">raster2dggs</a> to various global grid systems.</p>
      </div>
    );
  }

  render() {
    const {params} = this.props;
    return <App {...this.props} gridSystem={params.gridSystem.value} landcoverLegend={params.landcoverLegend.value} />;
  }
}

export default makeExample(GlobalGridsDemo); 