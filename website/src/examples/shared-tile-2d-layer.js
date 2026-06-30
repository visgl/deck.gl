// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/shared-tile-2d-layer/app';

import {makeExample} from '../components';

class SharedTile2DLayerDemo extends Component {
  static title = 'Shared Raster Tiles';

  static code = `${GITHUB_TREE}/examples/website/shared-tile-2d-layer`;

  static mapStyle = null;

  static renderInfo(meta) {
    return (
      <div>
        <p>
          One experimental SharedTileset2D feeds tiled BitmapLayers in the main view and minimap.
        </p>
        <p>
          OpenStreetMap data source:
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers</a>
        </p>
        <div className="stat">
          Tiles in last viewport<b>{meta.tileCount || 0}</b>
        </div>
      </div>
    );
  }

  _onTilesLoad = tileCount => {
    this.props.onStateChange({tileCount});
  };

  render() {
    return <App onTilesLoad={this._onTilesLoad} />;
  }
}

export default makeExample(SharedTile2DLayerDemo);
