import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/tagmap/app';

import makeExample from '../components/example';

class TextDemo extends Component {
  static title = 'Twitter Hashtags';

  static data = {
    url: `${DATA_URI}/hashtags100k.txt`,
    worker: '/workers/hashtags-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/tagmap`;

  static parameters = {
    cluster: {displayName: 'Dynamic Cluster', type: 'checkbox', value: true},
    fontSize: {displayName: 'Font Size',
      type: 'range', value: 32, step: 1, min: 20, max: 80}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Data set from Twitter showing hashtags with geolocation.</p>
        <p>Data source:
          <a href="">Twitter</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">No. of Tweets
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
        cluster={params.cluster.value}
        fontSize={params.fontSize.value} />
    );
  }
}

export default makeExample(TextDemo);
