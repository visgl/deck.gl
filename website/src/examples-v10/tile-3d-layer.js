// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/3d-tiles/app';

import {makeExample} from '../components';

/** Connects the Arrow tiles3 ddemo example to the website controls. */
class Tiles3DDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'City of Melbourne 3D Point Cloud';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/3d-tiles`;

  /** Interactive controls and their initial values. */
  static parameters = {};

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    if (!meta.attributions) {
      return null;
    }
    /** Provides attributions for the example. */
    const {attributions} = meta;
    return (
      <div style={{marginTop: '0.5cm'}}>
        <div style={{textAlign: 'center', borderStyle: 'groove'}}>
          {Boolean(attributions.length) && <b>Tileset Credentials</b>}
          {attributions.map(attribution => (
            // eslint-disable-next-line react/no-danger
            <div key={attribution.html} dangerouslySetInnerHTML={{__html: attribution.html}} />
          ))}
        </div>
      </div>
    );
  }

  /** Manages update attributions for the example. */
  _updateAttributions = attributions => {
    this.props.onStateChange({attributions});
  };

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    return <App {...this.props} updateAttributions={this._updateAttributions} />;
  }
}

export default makeExample(Tiles3DDemo);
