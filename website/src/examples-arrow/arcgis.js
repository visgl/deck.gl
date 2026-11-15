// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/i3s/app';

import {makeExample} from '../components';

/** Connects the Arrow arc gisdemo example to the website controls. */
class ArcGISDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'San Francisco 3D Buildings';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/i3s`;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          Highly detailed LoD2 textured 3D buildings for downtown San Francisco in I3S format,
          visualized with deck.gl's Tile3DLayer. This data is provided by{' '}
          <a href="https://www.precisionlightworks.com/">Precision Light Works (PLW)</a>.
        </p>
        <div>
          <img
            src="http://downloads.esri.com/blogs/arcgisonline/esrilogo_new.png"
            alt="ESRI logo"
          />
          <a href="https://www.arcgis.com/home/item.html?id=d3344ba99c3f4efaa909ccfbcc052ed5">
            Data profile page
          </a>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    return <App />;
  }
}

export default makeExample(ArcGISDemo);
