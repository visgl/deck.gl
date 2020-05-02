import React, {Component} from 'react';
import {MAPBOX_STYLES} from '../../constants/defaults';
import App from 'website-examples/map-tile/app';

export default class MapTileDemo extends Component {
  static get parameters() {
    return {
      showBorder: {displayName: 'Show tile borders', type: 'checkbox', value: false}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.BLANK;
  }

  static renderInfo() {
    return (
      <div>
        <h3>Raster Map Tiles</h3>
        <p>
          OpenStreetMap data source:
          <a href="https://en.wikipedia.org/wiki/OpenStreetMap"> Wiki </a> and
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers </a>
        </p>
      </div>
    );
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const {params, data, ...otherProps} = this.props;
    return <App {...otherProps} showBorder={params.showBorder.value} />;
  }
}
