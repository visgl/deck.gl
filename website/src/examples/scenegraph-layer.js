import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/scenegraph/app';

import {makeExample} from '../components';

class ScenegraphDemo extends Component {
  static title = 'Realtime Flight Tracker';

  static code = `${GITHUB_TREE}/examples/website/scenegraph`;

  static parameters = {
    sizeScale: {displayName: 'Size', type: 'range', value: 25, step: 5, min: 5, max: 500}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Data source:
          <a href="http://www.opensky-network.org">The OpenSky Network</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Planes
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        sizeScale={params.sizeScale.value}
        onDataLoad={count => this.props.onStateChange({count})}
      />
    );
  }
}

export default makeExample(ScenegraphDemo);
