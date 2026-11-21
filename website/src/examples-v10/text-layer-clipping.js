// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'v10-website-examples/treemap/app';
import {hierarchy} from 'd3-hierarchy';

import {makeExample} from '../components';

/** Connects the Arrow text example to the website controls. */
class TextDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'deck.gl bundle size';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/deck-bundle-stats.json`,
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/treemap`;

  /** Interactive controls and their initial values. */
  static parameters = {
    gzip: {displayName: 'Gzipped size', type: 'checkbox', value: true},
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Bundle size impact by deck.gl components and dependencies</p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params, data} = this.props;

    /** Provides size key for the example. */
    const sizeKey = params.gzip.value ? 'gzipSize' : 'parsedSize';
    /** Provides root for the example. */
    const root = data && hierarchy(data).sum(d => d[sizeKey]);

    return (
      <App
        {...this.props}
        data={root}
        width={3000}
        height={2000}
      />
    );
  }
}

export default makeExample(TextDemo);
