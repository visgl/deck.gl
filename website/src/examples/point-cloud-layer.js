import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/point-cloud/app';

import {makeExample} from '../components';

class PointCloudDemo extends Component {
  static title = '3D Indoor Scan';

  static code = `${GITHUB_TREE}/examples/website/point-cloud`;

  static renderInfo(meta) {
    return (
      <div>
        <p>This demo may not work on mobile devices due to browser limitations.</p>
        <p>
          Data source: <a href="https://kaarta.com">kaarta.com</a>
        </p>
        <div className="stat">
          No. of Points
          <b>{readableInteger(meta.count)}</b>
        </div>
      </div>
    );
  }

  _onLoad = meta => {
    this.props.onStateChange(meta);
  };

  render() {
    return <App onLoad={this._onLoad} />;
  }
}

export default makeExample(PointCloudDemo);
