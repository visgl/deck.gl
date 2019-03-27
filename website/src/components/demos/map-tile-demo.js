import React, {Component} from 'react';
import {MAPBOX_STYLES} from '../../constants/defaults';
import {App, INITIAL_VIEW_STATE} from 'website-examples/map-tile/app';

export default class LineDemo extends Component {
  static get parameters() {
    return {
      autoHighlight: {displayName: 'Enable autoHighlight', type: 'checkbox', value: true}
    };
  }

  static get allowMissingData() {
    return true;
  }

  static get viewport() {
    return INITIAL_VIEW_STATE;
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo() {
    return (
      <div>
        <p>
          OpenStreetsMap
          <br />
          <a href="https://en.wikipedia.org/wiki/OpenStreetMap"> Wiki </a>
          <br />
          <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers </a>
          <br />
          <a href="https://www.openstreetmap.org/"> Explorer </a>
          <br />
        </p>
      </div>
    );
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const {params, data, ...otherProps} = this.props;
    return <App {...otherProps} autoHighlight={params.autoHighlight.value} />;
  }
}
