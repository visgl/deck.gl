// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import App from 'website-examples/mesh/app';
import {GITHUB_TREE} from '../constants/defaults';
import {makeExample} from '../components';

class SimpleMeshDemo extends Component {
  static title = 'Instanced 3D Mini Coopers';

  static code = `${GITHUB_TREE}/examples/website/mesh`;

  static hasDeviceTabs = true;

  static renderInfo() {
    return (
      <div>
        <p>A grid of 100 independently positioned, colored, and oriented 3D meshes.</p>
        <div className="stat">
          No. of Meshes
          <b>100</b>
        </div>
      </div>
    );
  }

  render() {
    return <App key={this.props.device?.type} device={this.props.device} />;
  }
}

export default makeExample(SimpleMeshDemo);
