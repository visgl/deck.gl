// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/shared-tile-2d-layer/app';

import {makeExample} from '../components';

/** Website wrapper using its existing infobox instead of duplicate local statistics. */
class Tile2DLayerDemo extends Component {
  /** Display name in the example gallery. */
  static title = 'Shared Tileset';

  /** Source link for the standalone app reused by this page. */
  static code = `${GITHUB_TREE}/examples/website/shared-tile-2d-layer`;

  /** The app supplies its own raster tiles rather than a separate basemap. */
  static mapStyle = null;

  /** Explains cache comparison and displays counters observed by the owner. */
  static renderInfo(meta) {
    return (
      <div className="shared-tiles-example-info">
        <p className="shared-tiles-example-description">
          Two Tile2DLayers show the same raster tiles with different styles. A third view
          shows the same region zoomed out. Toggle sharing to compare one cache with two.
        </p>
        <p className="shared-tiles-example-description">
          OpenStreetMap data source:
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers</a>
        </p>
        <dl className="shared-tiles-example-stats" aria-label="Tile cache statistics">
          <dt>Tilesets</dt><dd>{meta.caches || 1}</dd>
          <dt>Requests started</dt><dd>{meta.requests || 0}</dd>
          <dt>Visible entries</dt><dd>{meta.visible || 0}</dd>
          <dt>Cached entries</dt><dd>{meta.cached || 0}</dd>
          <dt>Loading</dt><dd>{meta.loading || 0}</dd>
        </dl>
        <p className="shared-tiles-example-description">Counts reset when switching modes. Entries are counted once per cache.</p>
      </div>
    );
  }

  /** Mirrors subscription-driven counters into the website's existing infobox. */
  _onStatsChange = stats => {
    this.props.onStateChange(stats);
  };

  /** Renders the shared app without its duplicate statistics panel. */
  render() {
    return <App onStatsChange={this._onStatsChange} showStats={false} />;
  }
}

export default makeExample(Tile2DLayerDemo);
