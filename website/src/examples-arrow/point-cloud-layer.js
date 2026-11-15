// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import {readableInteger} from '../utils/format-utils';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/point-cloud/app';

import {makeExample} from '../components';

/** Connects the Arrow point cloud example to the website controls. */
class PointCloudDemo extends Component {
  /** Title shown above the example controls. */
  static title = '3D Indoor Scan';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/point-cloud`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Renders the description, legend, and data summary. */
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

  /** Manages on load for the example. */
  _onLoad = meta => {
    this.props.onStateChange(meta);
  };

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides widgets for the example. */
    const widgets = [new StatsWidget({type: 'device'})];
    return <div style={{width: '100%', height: '100%', background: '#ecdbce'}}>
      <App
        key={this.props.device?.type}
        device={this.props.device}
        onLoad={this._onLoad}
        widgets={widgets}
      />
    </div>;
  }
}

export default makeExample(PointCloudDemo);
