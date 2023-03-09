import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/radio/app';

import {makeExample} from '../components';

class MultiViewDemo extends Component {
  static title = 'Radio Stations in the United States';

  static data = {
    url: `${DATA_URI}/radio-stations.txt`,
    worker: '/workers/radio-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/radio`;

  static parameters = {
    showMinimap: {displayName: 'Minimap', type: 'checkbox', value: true}
  };

  static mapStyle = MAPBOX_STYLES.LIGHT_LABEL;

  static renderInfo(meta) {
    return (
      <div>
        <p>Radio stations and their service contour in the United States.</p>
        <p>
          Data source: <a href="https://www.fcc.gov">Federal communications Commission</a>
        </p>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;
    const showMinimap = params.showMinimap.value;

    return <App {...otherProps} data={data} showMinimap={showMinimap} />;
  }
}

export default makeExample(MultiViewDemo);
