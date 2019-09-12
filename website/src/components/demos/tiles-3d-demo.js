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
    return (
      <div>
        <h3>Vancouver Property Value</h3>
        <p>The property value of Vancouver, BC</p>
        <p>
          Height of polygons - average property value per square meter of lot
          <br />
          Color - value growth from last assessment
        </p>
        <p>
          Data source:&nbsp;
          <a href="http://data.vancouver.ca/">City of Vancouver</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Polygons
            <b>{readableInteger(meta.count) || 0}</b>
          </div>
          <div className="stat col-1-2">
            No. of Vertices
            <b>{readableInteger(meta.vertexCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <App {...this.props} />;
  }
}
