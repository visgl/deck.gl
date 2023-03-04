import React, {Component} from 'react';

import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/trips/app';

import {makeExample} from '../components';

class TripsDemo extends Component {
  static title = 'Yellow Cab Vs. Green Cab Trips in Manhattan';

  static data = [
    {
      url: `${DATA_URI}/trips-data.txt`,
      worker: '/workers/trips-data-decoder.js?loop=1800&trail=180'
    },
    {
      url: `${DATA_URI}/building-data.txt`,
      worker: '/workers/building-data-decoder.js'
    }
  ];

  static code = `${GITHUB_TREE}/examples/website/trips`;

  static parameters = {
    trail: {displayName: 'Trail', type: 'range', value: 180, step: 1, min: 10, max: 200}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Trips are taken from June 16, 2016 21:00 to 21:30</p>
        <p>
          Trip data source:&nbsp;
          <a href="http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml">
            NYC Taxi & Limousine Commission Trip Records
          </a>
        </p>
        <p>
          Building data source:&nbsp;
          <a href="http://openstreetmap.org">OpenStreetMap</a> via&nbsp;
          <a href="https://mapzen.com/">Mapzen Vector Tiles API</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Trips
            <b>{readableInteger(meta.trips || 0)}</b>
          </div>
          <div className="stat col-1-2">
            No. of Buildings
            <b>{readableInteger(meta.buildings || 0)}</b>
          </div>
        </div>
        <div className="layout">
          <div className="stat col-1-2">
            Vertices
            <b>{readableInteger((meta.vertices || 0) + (meta.triangles || 0) * 3)}</b>
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
        trips={data && data[0]}
        buildings={data && data[1]}
        animationSpeed={0.5}
        trailLength={params.trail.value}
      />
    );
  }
}

export default makeExample(TripsDemo);
