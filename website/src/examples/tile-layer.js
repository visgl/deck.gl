// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global requestAnimationFrame */
import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/map-tile/app';

import {makeExample} from '../components';

class MapTileDemo extends Component {
  static title = 'Raster Map Tiles';

  static code = `${GITHUB_TREE}/examples/website/map-tile`;

  static parameters = {
    showBorder: {displayName: 'Show tile borders', type: 'checkbox', value: false},
    minZoom: {displayName: 'Min Zoom', type: 'range', value: 0, step: 1, min: 0, max: 19},
    maxZoom: {displayName: 'Max Zoom', type: 'range', value: 19, step: 1, min: 0, max: 19},
    overdraw: {displayName: 'Overdraw', type: 'checkbox', value: true},
    useExtent: {displayName: 'Extent (France)', type: 'checkbox', value: false}
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>
          OpenStreetMap data source:
          <a href="https://en.wikipedia.org/wiki/OpenStreetMap"> Wiki </a> and
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers </a>
        </p>
        <div className="stat">
          No. of Tiles Loaded<b>{meta.tileCount || 0}</b>
        </div>
      </div>
    );
  }

  _onTilesLoad = tiles => {
    // onViewportLoad is called during tileLayer.updateState
    // Updating React state here may trigger another round of layer updates and create a racing condition
    // TODO - Fix this in TileLayer
    requestAnimationFrame(() => this.props.onStateChange({tileCount: tiles.length}));
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {params, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        showBorder={params.showBorder.value}
        minZoom={params.minZoom.value}
        maxZoom={params.maxZoom.value}
        overdraw={params.overdraw.value}
        useExtent={params.useExtent.value}
        onTilesLoad={this._onTilesLoad}
      />
    );
  }
}

export default makeExample(MapTileDemo);
