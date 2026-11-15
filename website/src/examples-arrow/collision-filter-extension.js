// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/collision-filter/app';

import {makeExample} from '../components';

/** Connects the Arrow collision example to the website controls. */
class CollisionDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Mexico principals roads';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/collision-filter`;

  /** Interactive controls and their initial values. */
  static parameters = {
    sizeScale: {
      displayName: 'Label spacing',
      type: 'range',
      value: 5,
      step: 1,
      min: 2,
      max: 10
    },
    collisionEnabled: {
      displayName: 'Avoid overlap',
      type: 'checkbox',
      value: true
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Principal roads from Mexico</p>
        <p>
          Data sources:
          <div>
            <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth </a>
          </div>
        </p>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, ...other props for the example. */
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        sizeScale={params.sizeScale.value}
        collisionEnabled={params.collisionEnabled.value}
      />
    );
  }
}

export default makeExample(CollisionDemo);
