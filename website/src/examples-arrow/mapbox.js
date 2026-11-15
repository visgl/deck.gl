// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component, createRef} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/mapbox/app';

import {makeExample} from '../components';

/** Connects the Arrow mapbox example to the website controls. */
class MapboxDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Who Is Visiting San Francisco?';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/mapbox`;

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/safegraph.txt`,
    worker: '/workers/poi-data-decoder.js'
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          Visitors to San Francisco businesses, grouped by their home census block group, during the
          first week of Feb 2020.
        </p>
        <p>Click on a region to see where its visitors come from.</p>
        <p>
          Data source: <a href="https://docs.safegraph.com/docs/weekly-patterns">SafeGraph</a>
        </p>
      </div>
    );
  }

  /** Manages container ref for the example. */
  _containerRef = createRef();

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides data, ...other props for the example. */
    const {data, ...otherProps} = this.props;
    return <App {...otherProps} data={data}/>;
  }
}

export default makeExample(MapboxDemo);
