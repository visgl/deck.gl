import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/text/app';

import {makeExample} from '../components';

class TextDemo extends Component {
  static title = 'World Cities by Population';

  static data = {
    url: `${DATA_URI}/geonames.txt`,
    worker: '/workers/geonames-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/text`;

  static parameters = {
    noOverlap: {displayName: 'Prevent overlap', type: 'checkbox', value: true},
    fontSize: {displayName: 'Font Size',
      type: 'range', value: 32, step: 1, min: 20, max: 80}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>World cities with population more than 1000</p>
        <p>Data source:
          <a href="https://data.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000%40public/information/?disjunctive.cou_name_en">GeoNames</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">No. of cities
            <b>{ readableInteger(meta.count || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;

    return (
      <App
        {...this.props}
        data={data}
        noOverlap={params.noOverlap.value}
        fontSize={params.fontSize.value} />
    );
  }
}

export default makeExample(TextDemo);
