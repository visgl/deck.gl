import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/360-video/app';

import {makeExample} from '../components';

class FirstPersonViewDemo extends Component {
  static title = '360 Video: NASA Astronaut Training';

  static code = `${GITHUB_TREE}/examples/website/360-video`;

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

  render() {
    return <App {...this.props} />;
  }
}

export default makeExample(FirstPersonViewDemo);
