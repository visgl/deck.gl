import React, {Component} from 'react';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import ViewportAnimation from '../../utils/map-utils';
import TripsOverlay from '../../../../examples/trips/deckgl-overlay';

export default class TripsDemo extends Component {

  static get data() {
    return [
      {
        url: 'data/trips-data.txt',
        worker: 'workers/trips-data-decoder.js?loop=1800&trail=180'
      },
      {
        url: 'data/building-data.txt',
        worker: 'workers/building-data-decoder.js'
      }
    ];
  }

  static get parameters() {
    return {
      trail: {displayName: 'Trail', type: 'range', value: 180, step: 1, min: 10, max: 200}
    };
  }

  static get viewport() {
    return {
      ...TripsOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
    };
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

  constructor(props) {
    super(props);

    this.state = {time: 0};

    const thisDemo = this; // eslint-disable-line

    this.tween = ViewportAnimation.ease({time: 0}, {time: 1800}, 60000)
      .onUpdate(function tweenUpdate() {
        thisDemo.setState(this); // eslint-disable-line
      })
      .repeat(Infinity);
  }

  componentDidMount() {
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  render() {
    const {viewport, data, params} = this.props;

    if (!data) {
      return null;
    }

    return (
      <TripsOverlay viewport={viewport}
        trips={data[0]}
        buildings={data[1]}
        trailLength={params.trail.value}
        time={this.state.time} />
    );
  }
}
