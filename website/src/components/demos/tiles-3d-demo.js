import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';
import {App} from 'website-examples/3d-tiles/app';

export default class GeoJsonDemo extends Component {
  static get data() {
    return [];
  }

  static get parameters() {
    return {};
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return null;
  }

  render() {
    return <App {...this.props} />;
  }
}
