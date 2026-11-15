// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component, createRef} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'arrow-website-examples/google-3d/app';

import {makeExample} from '../components';

/** Connects the Arrow google maps example to the website controls. */
class GoogleMapsDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Animated Truck Routes';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/google-3d`;

  /** Interactive controls and their initial values. */
  static parameters = {
    tracking: {displayName: 'Camera tracking', type: 'checkbox', value: true},
    paths: {displayName: 'Show paths', type: 'checkbox', value: false}
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Interleaving 3D layers with Google Maps</p>

        <p>
          <a href="https://sketchfab.com/3d-models/low-poly-truck-98826ebd44e2492298ac925461509216">
            Low Poly Truck
          </a>{' '}
          model by <a href="https://sketchfab.com/Arifido._">Arifido._</a> licensed under{' '}
          <a href="http://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a>
        </p>
      </div>
    );
  }

  /** Manages container ref for the example. */
  _containerRef = createRef();

  /** Initializes the demo after its container mounts. */
  componentDidMount() {
    /** Provides params for the example. */
    const {params} = this.props;
    renderToDOM(this._containerRef.current, {
      tracking: params.tracking.value,
      showPaths: params.paths.value
    }).then(instance => (this._view = instance));
  }

  /** Releases demo resources when leaving the page. */
  componentWillUnmount() {
    if (this._view) {
      this._view.remove();
    }
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params for the example. */
    const {params} = this.props;

    if (this._view) {
      this._view.update({
        tracking: params.tracking.value,
        showPaths: params.paths.value
      });
    }

    return <div ref={this._containerRef} style={{width: '100%', height: '100%'}} />;
  }
}

export default makeExample(GoogleMapsDemo);
