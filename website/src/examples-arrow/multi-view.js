// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/radio/app';

import {makeExample} from '../components';

/** Connects the Arrow multi view example to the website controls. */
class MultiViewDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Radio Stations in the United States';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/radio-stations.txt`,
    worker: '/workers/radio-data-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/radio`;

  /** Interactive controls and their initial values. */
  static parameters = {
    showMinimap: {displayName: 'Minimap', type: 'checkbox', value: true}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.LIGHT_LABEL;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Radio stations and their service contour in the United States.</p>
        <p>
          Data source: <a href="https://www.fcc.gov">Federal communications Commission</a>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data, ...other props for the example. */
    const {params, data, ...otherProps} = this.props;
    /** Provides show minimap for the example. */
    const showMinimap = params.showMinimap.value;

    return <App {...otherProps} data={data} showMinimap={showMinimap} />;
  }
}

export default makeExample(MultiViewDemo);
