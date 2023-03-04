/* global requestAnimationFrame */
import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/map-tile/app';

import {makeExample} from '../components';

class MapTileDemo extends Component {
  static title = 'Raster Map Tiles';

  static code = `${GITHUB_TREE}/examples/website/map-tile`;

  static parameters = {
    showBorder: {displayName: 'Show tile borders', type: 'checkbox', value: false}
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
      <App {...otherProps} showBorder={params.showBorder.value} onTilesLoad={this._onTilesLoad} />
    );
  }
}

export default makeExample(MapTileDemo);
