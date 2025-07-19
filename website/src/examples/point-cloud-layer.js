// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/point-cloud/app';

import {makeExample} from '../components';

class PointCloudDemo extends Component {
  static title = '3D Indoor Scan';

  static code = `${GITHUB_TREE}/examples/website/point-cloud`;

  static hasDeviceTabs = true;

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
    return <div style={{width: '100%', height: '100%', background: '#ecdbce'}}>
      <App key={this.props.device?.type} device={this.props.device} onLoad={this._onLoad} />
    </div>;
  }
}

export default makeExample(PointCloudDemo);
