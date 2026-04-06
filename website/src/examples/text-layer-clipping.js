// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/treemap/app';
import {hierarchy} from 'd3-hierarchy';

import {makeExample} from '../components';

class TextDemo extends Component {
  static title = 'deck.gl bundle size';

  static data = {
    url: `${DATA_URI}/deck-bundle-stats.json`,
  };

  static code = `${GITHUB_TREE}/examples/website/treemap`;

  static parameters = {
    gzip: {displayName: 'Gzipped size', type: 'checkbox', value: true},
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>Bundle size impact by deck.gl components and dependencies</p>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;

    const sizeKey = params.gzip.value ? 'gzipSize' : 'parsedSize';
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
