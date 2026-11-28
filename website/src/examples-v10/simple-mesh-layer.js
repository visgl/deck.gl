// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import App from 'v10-website-examples/mesh/app';
import {GITHUB_TREE} from '../constants/defaults';
import {makeExample} from '../components';

/** Connects the Arrow simple mesh example to the website controls. */
class SimpleMeshDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Instanced 3D Mini Coopers';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/mesh`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Renders the description, legend, and data summary. */
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

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    return <App key={this.props.device?.type} device={this.props.device} />;
  }
}

export default makeExample(SimpleMeshDemo);
