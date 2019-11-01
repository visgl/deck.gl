import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import App from 'website-examples/tagmap/app';

export default class TextDemo extends Component {

  static get data() {
    return {
      url: `${DATA_URI}/hashtags100k.txt`,
      worker: 'workers/hashtags-decoder.js'
    };
  }

  static get parameters() {
    return {
      cluster: {displayName: 'Dynamic Cluster', type: 'checkbox', value: true},
      fontSize: {displayName: 'Font Size',
        type: 'range', value: 32, step: 1, min: 20, max: 80}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Twitter Hashtags</h3>
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
      <div className="text-demo">
        <App
          {...this.props}
          data={data}
          cluster={params.cluster.value}
          fontSize={params.fontSize.value} />
      </div>
    );
  }
}
