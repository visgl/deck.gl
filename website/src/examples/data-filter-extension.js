import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/data-filter/app';

import {makeExample} from '../components';

class DataFilterDemo extends Component {
  static title = '40 Years of Earthquakes';

  static data = {
    url: `${DATA_URI}/earthquakes.txt`,
    worker: '/workers/earthquakes-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/data-filter`;

  static parameters = {};

  static mapStyle = MAPBOX_STYLES.LIGHT;

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Earthquakes of magnitude 4.5 and above
          <br />
          (1979 - 2019)
        </p>
        <p>
          Data source:
          <a href="https://earthquake.usgs.gov"> U.S. Geological Survey</a>
        </p>
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,85,170,1) 67%, rgba(0,200,255,1) 100%)',
            width: '100%',
            height: 8
          }}
        />
        <p className="layout">
          <span className="col-1-2">Shallow</span>
          <span className="col-1-2 text-right">Deep</span>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Earthquakes
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {data, ...otherProps} = this.props;
    // renders the data filter demo app wrapped in necessary BaseUI and Styletron providers
    return <App data={data} {...otherProps} />;
  }
}

export default makeExample(DataFilterDemo);
