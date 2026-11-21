// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/360-video/app';

import {makeExample} from '../components';

/** Connects the Arrow first person view example to the website controls. */
class FirstPersonViewDemo extends Component {
  /** Title shown above the example controls. */
  static title = '360 Video: NASA Astronaut Training';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/360-video`;

  /** Renders the description, legend, and data summary. */
  static renderInfo() {
    return (
      <div>
        <p>
          The 360 video was created by NASA Jet Propulsion Laboratory, Public domain, via
          <a href="https://commons.wikimedia.org/wiki/File:NASA_VR-360_Astronaut_Training-_Space_Walk.webm">
            {' '}
            Wikimedia Commons
          </a>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    return <App {...this.props} />;
  }
}

export default makeExample(FirstPersonViewDemo);
