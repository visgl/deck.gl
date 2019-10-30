import React, {Component} from 'react';

import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import App from 'website-examples/trips/app';

const EMPTY_ARRAY = [];

export default class TripsDemo extends Component {

  static get data() {
    return [
      {
        url: `${DATA_URI}/trips-data.txt`,
        worker: 'workers/trips-data-decoder.js?loop=1800&trail=180'
      },
      {
        url: `${DATA_URI}/building-data.txt`,
        worker: 'workers/building-data-decoder.js'
      }
    ];
  }

  static get parameters() {
    return {
      trail: {displayName: 'Trail', type: 'range', value: 180, step: 1, min: 10, max: 200}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Yellow Cab Vs. Green Cab Trips in Manhattan</h3>
        <p>Trips are taken from June 16, 2016 21:00 to 21:30</p>
        <p>Trip data source:&nbsp;
          <a href="http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml">
          NYC Taxi & Limousine Commission Trip Records</a>
        </p>
        <p>Building data source:&nbsp;
          <a href="http://openstreetmap.org">OpenStreetMap</a> via&nbsp;
          <a href="https://mapzen.com/">Mapzen Vector Tiles API</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">No. of Trips
            <b>{ readableInteger(meta.trips || 0) }</b>
          </div>
          <div className="stat col-1-2">No. of Buildings
            <b>{ readableInteger(meta.buildings || 0) }</b>
          </div>
        </div>
        <div className="layout">
          <div className="stat col-1-2">Vertices
            <b>{ readableInteger((meta.vertices || 0) + (meta.triangles || 0) * 3) }</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {data, params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        trips={data && data[0] || EMPTY_ARRAY}
        buildings={data && data[1] || EMPTY_ARRAY}
        trailLength={params.trail.value} />
    );
  }
}
