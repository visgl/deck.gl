import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/scenegraph/app';

import makeExample from '../components/simplemesh';

class SimpleMeshDemo extends Component {
  static title = '360 Video';

  static code = `${GITHUB_TREE}/examples/website/simplemesh`;

  static parameters = {};

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Video source:
          <a href="https://commons.wikimedia.org/wiki/File:Earth_360_Video_The_Call_of_Science.webm">NASA Jet Propulsion Laboratory</a>, Public domain, via Wikimedia Commons
        </p>
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;
    return <App {...otherProps}/>;
  }
}

export default makeExample(SimpleMeshDemo);
