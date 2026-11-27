// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/carto-sql/app';

import {makeExample} from '../components';

/** Provides urbanity for the example. */
const URBANITY = {
  All: 'any',
  Remote: 'remote',
  Rural: 'rural',
  'Low-density urban': 'Low_density_urban',
  'Medium-density urban': 'Medium_density_urban',
  'High-density urban': 'High_density_urban',
  'VeryHigh-density urban': 'Very_High_density_urban'
};

/** Connects the Arrow carto sqldemo example to the website controls. */
class CartoSQLDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'CARTO Spatial Features — USA';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/carto-sql`;

  /** Interactive controls and their initial values. */
  static parameters = {
    urbanity: {
      displayName: 'Urbanity',
      type: 'select',
      options: Object.keys(URBANITY),
      value: 'All'
    },
    tourism: {
      displayName: 'Tourism Presence',
      type: 'range',
      min: 0,
      max: 10,
      step: 1,
      value: 0
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  /** Renders the description, legend, and data summary. */
  static renderInfo() {
    return (
      <div>
        <p>
          Spatial Features is a dataset curated by CARTO, providing access to unified demographic,
          environmental, and economical variables using spatial indexes. This particular example
          covers the United States, using an H3 grid.
        </p>
        <p>
          This data is hosted in a cloud data warehouse (eg: BigQuery, Snowflake...) and is queried
          live using SQL, including parameters, thanks to CARTO cloud-native connectivity.
        </p>
        <p>Population</p>
        <div style={{height: 8, width: '100%', display: 'flex', flexDirection: 'row'}}>
          <div style={{flex: '0 0 14.28%', background: 'rgb(254, 246, 181)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 221, 154)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 194, 133)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(255, 166, 121)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(250, 138, 118)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(241, 109, 122)'}} />
          <div style={{flex: '0 0 14.28%', background: 'rgb(225, 83, 131)'}} />
        </div>
        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
          <div style={{width: '14.28%'}}>0</div>
          <div style={{width: '14.28%'}}>10</div>
          <div style={{width: '14.28%'}}>100</div>
          <div style={{width: '14.28%'}}>1k</div>
          <div style={{width: '14.28%'}}>10k</div>
          <div style={{width: '14.28%'}}>50k</div>
          <div style={{width: '14.28%'}}>100k</div>
        </div>
        <p>
          Data source:{' '}
          <a href="https://carto.com/spatial-data-catalog/browser/dataset/cdb_spatial_fea_94e6b1f/">
            CARTO
          </a>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params for the example. */
    const {params} = this.props;
    /** Provides urbanity for the example. */
    const urbanity = URBANITY[params.urbanity.value];
    /** Provides tourism for the example. */
    const tourism = params.tourism.value;

    return <App {...this.props} urbanity={urbanity} tourism={tourism} />;
  }
}

export default makeExample(CartoSQLDemo);
