import React, {Component, createRef} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/maptiler/app';

import {makeExample} from '../components';

class MapTilerDemo extends Component {
  static title = 'Who Is Visiting San Francisco?';

  static code = `${GITHUB_TREE}/examples/website/maptiler`;

  static data = {
    url: `${DATA_URI}/safegraph.txt`,
    worker: '/workers/poi-data-decoder.js'
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Visitors to San Francisco businesses, grouped by their home census block group, during the
          first week of Feb 2020.
        </p>
        <p>Click on a region to see where its visitors come from.</p>
        <p>
          Data source: <a href="https://docs.safegraph.com/docs/weekly-patterns">SafeGraph</a>
        </p>
      </div>
    );
  }

  _containerRef = createRef();

  render() {
    const {data, ...otherProps} = this.props;
    return <App {...otherProps} data={data}/>;
  }
}

export default makeExample(MapTilerDemo);
