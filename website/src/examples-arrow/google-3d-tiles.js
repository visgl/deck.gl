// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLORS} from 'arrow-website-examples/google-3d-tiles/app';

import {makeExample} from '../components';

/** Connects the Arrow google3d tiles example to the website controls. */
class Google3dTilesDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Photorealistic 3D Tiles';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/google-3d-tiles`;

  /** Interactive controls and their initial values. */
  static parameters = {
    globeView: {displayName: 'Globe View', type: 'checkbox', value: false},
    distance: {displayName: 'Distance to tree', type: 'range', value: 0, step: 1, min: 0, max: 400},
    opacity: {displayName: 'Opacity', type: 'range', value: 0.2, step: 0.01, min: 0, max: 0.5}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Colored building outlines draped over Google Photorealistic 3D Tiles.</p>
        <p>
          See <a href="https://3dtiles.carto.com">full interactive Story Map</a>
        </p>
        <div className="layout">
          {COLORS.map((color, i) => {
            return (
              <div
                className="legend"
                key={i}
                style={{
                  background: `rgb(${color.join(',')})`,
                  width: `${100 / COLORS.length}%`
                }}
              />
            );
          })}
        </div>
        <p className="layout">
          <span className="col-1-2">Close</span>
          <span className="col-1-2 text-right">Far</span>
        </p>
        <p>Buildings are colored according to the distance to the nearest tree</p>
        <p>Data sources:</p>
        <ul>
          <li>
            <a href="https://land.copernicus.eu/pan-european/high-resolution-layers/forests/tree-cover-density">
              Tree Cover Density
            </a>
          </li>
          <li>
            <a href="https://wiki.openstreetmap.org/wiki/BigQuery_dataset">Building footprints</a>
          </li>
          <li>
            <a href="https://developers.google.com/maps/documentation/tile/3d-tiles-overview">
              Map Tiles API
            </a>
          </li>
        </ul>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params for the example. */
    const {params} = this.props;
    /** Provides distance for the example. */
    const distance = params.distance.value;
    /** Provides opacity for the example. */
    const opacity = params.opacity.value;
    /** Provides globe view for the example. */
    const globeView = params.globeView.value;

    return <App {...this.props} distance={distance} opacity={opacity} globeView={globeView} />;
  }
}

export default makeExample(Google3dTilesDemo);
