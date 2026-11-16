// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import styled from 'styled-components';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'v10-website-examples/icon/app';

import {makeExample} from '../components';

/** Provides icon demo container for the example. */
const IconDemoContainer = styled.div`
  .tooltip {
    h5 {
      font-size: 1.1em;
      margin: 8px 0 0;
    }
    p {
      display: none;
      text-indent: 4px;
    }
  }
  .tooltip.interactive {
    border: solid 4px transparent;
    margin: -4px;
    background: #ffffff;
    color: #19202c;
    pointer-events: all;
    width: 240px;
    max-height: 320px;
    overflow-y: auto;

    p {
      display: block;
    }
  }
`;

/** Connects the Arrow icon example to the website controls. */
class IconDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Meteorites Landings';

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/meteorites.txt`,
    worker: '/workers/meteorites-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/icon`;

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Interactive controls and their initial values. */
  static parameters = {
    cluster: {displayName: 'Cluster', type: 'checkbox', value: true}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          Data set from The Meteoritical Society showing information on all of the known meteorite
          landings.
        </p>
        <p>Hover on a pin to see the list of names</p>
        <p>Click on a pin to see the details</p>
        <p>
          Data source:
          <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh"> NASA</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Meteorites
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data, ...other props for the example. */
    const {params, data, ...otherProps} = this.props;

    return (
      <IconDemoContainer>
        <App
          key={this.props.device?.type}
          device={this.props.device}
          {...otherProps}
          data={data}
          iconAtlas={`${DATA_URI}/../examples/icon/location-icon-atlas.png`}
          iconMapping={`${DATA_URI}/../examples/icon/location-icon-mapping.json`}
          showCluster={params.cluster.value}
        />
      </IconDemoContainer>
    );
  }
}

export default makeExample(IconDemo);
