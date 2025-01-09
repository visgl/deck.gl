// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/maplibre/app';

import {makeExample} from '../components';

class MapLibreDemo extends React.Component {
  static title = 'MapLibre Integration';

  static code = `${GITHUB_TREE}/examples/website/maplibre`;

  static data = {
    url: `${DATA_URI}/air-traffic.txt`,
    worker: '/workers/air-traffic-decoder.js'
  };

  static renderInfo() {
    return (
      <div>
        <p>
          Integration with MapLibre GL JS using the MapboxOverlay API.
          This example demonstrates how to use deck.gl with MapLibre GL JS for base maps.
        </p>
      </div>
    );
  }

  render() {
    return <App {...this.props} />;
  }
}

export default makeExample(MapLibreDemo); 