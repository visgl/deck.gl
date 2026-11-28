// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global requestAnimationFrame */
import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/map-tile/app';

import {makeExample} from '../components';

/** Connects the Arrow map tile example to the website controls. */
class MapTileDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Raster Map Tiles';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/map-tile`;

  /** Interactive controls and their initial values. */
  static parameters = {
    minZoom: {displayName: 'Min Zoom', type: 'range', value: 3, step: 1, min: 0, max: 19, accentColor: '#0275ff'},
    maxZoom: {displayName: 'Max Zoom', type: 'range', value: 8, step: 1, min: 0, max: 19, accentColor: '#0275ff'},
    visibleMinZoom: {displayName: 'Visible Min Zoom', type: 'range', value: 1, step: 1, min: 0, max: 19, accentColor: '#1a2b4a'},
    visibleMaxZoom: {displayName: 'Visible Max Zoom', type: 'range', value: 12, step: 1, min: 0, max: 19, accentColor: '#1a2b4a'},
    zoomOffset: {displayName: 'Zoom Offset', type: 'range', value: 0, step: 1, min: -2, max: 2},
    showBorder: {displayName: 'Show tile borders', type: 'checkbox', value: false},
    useExtent: {displayName: 'Extent (France)', type: 'checkbox', value: false}
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          OpenStreetMap data source:
          <a href="https://en.wikipedia.org/wiki/OpenStreetMap"> Wiki </a> and
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers </a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Tiles Loaded<b>{meta.tileCount || 0}</b>
          </div>
          <div className="stat col-1-2">
            Viewport Zoom<b>{meta.zoom != null ? meta.zoom.toFixed(1) : '-'}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Manages on tiles load for the example. */
  _onTilesLoad = tiles => {
    // onViewportLoad is called during tileLayer.updateState
    // Updating React state here may trigger another round of layer updates and create a racing condition
    // TODO - Fix this in TileLayer
    requestAnimationFrame(() => this.props.onStateChange({tileCount: tiles.length}));
  };

  /** Manages on zoom change for the example. */
  _onZoomChange = zoom => {
    this.props.onStateChange({zoom});
  };

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    // eslint-disable-next-line no-unused-vars
    /** Provides params, ...other props for the example. */
    const {params, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        key={this.props.device?.type}
        device={this.props.device}
        showBorder={params.showBorder.value}
        minZoom={params.minZoom.value}
        maxZoom={params.maxZoom.value}
        visibleMinZoom={params.visibleMinZoom.value}
        visibleMaxZoom={params.visibleMaxZoom.value}
        zoomOffset={params.zoomOffset.value}
        useExtent={params.useExtent.value}
        onTilesLoad={this._onTilesLoad}
        onZoomChange={this._onZoomChange}
      />
    );
  }
}

export default makeExample(MapTileDemo);
