import 'babel-polyfill';
import React, {Component} from 'react';
import DeckGL from '../../../../../react';
import {ExtrudedChoroplethLayer64} from '../../../../../index';
import TripsLayer from './trips-layer/trips-layer';
import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import ViewportAnimation from '../../utils/map-utils';

const BLENDING = {
  enable: true,
  blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
  blendEquation: 'FUNC_ADD'
};

export default class HeroDemo extends Component {

  static get data() {
    return [
      {
        url: 'data/hero-data.txt',
        worker: 'workers/hero-data-decoder.js?loop=3600&trail=180'
      },
      {
        url: 'data/building-data.txt',
        worker: 'workers/building-data-decoder.js'
      }
    ];
  }

  static get parameters() {
    return {};
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.DARK,
      longitude: -74,
      latitude: 40.74,
      zoom: 12,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Yellow Cab Vs. Green Cab Trips in Manhattan</h3>
        <p>June 16, 2016 21:00 - 22:00</p>
        <p>Trip data source:&nbsp;
          <a href="http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml">
          NYC Taxi & Limousine Commission Trip Records</a>
        </p>
        <p>Building data source:&nbsp;
          <a href="http://openstreetmap.org">OpenStreetMap</a> via&nbsp;
          <a href="https://mapzen.com/">Mapzen Vector Tiles API</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">Trips
            <b>{ readableInteger(meta.trips || 0) }</b>
          </div>
          <div className="stat col-1-2">Vertices
            <b>{ readableInteger(meta.vertices || 0) }</b>
          </div>
        </div>
        <div className="layout">
          <div className="stat col-1-2">Buildings
            <b>{ readableInteger(meta.buildings || 0) }</b>
          </div>
          <div className="stat col-1-2">Triangles
            <b>{ readableInteger(meta.triangles || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      time: 0
    };
    this.tween = ViewportAnimation.ease({time: 0}, {time: 3600}, 120000)
      .onUpdate(function() { thisDemo.setState(this) })
      .repeat(Infinity);
  }

  componentDidMount() {
    const thisDemo = this;
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  render() {
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }
    const layers = [].concat(
      data[1] && data[1].map((d, i) => new ExtrudedChoroplethLayer64({
        id: `building=${i}`,
        data: d,
        color: [72, 72, 72],
        opacity: 0.5
      })),
      data[0] && data[0].map((layerData, layerIndex) => new TripsLayer({
          id: `trips-${layerIndex}`,
          data: layerData,
          getPath: d => d.segments,
          getColor: d => d.vendor === 0 ? [253,128,93] : [23,184,190],
          opacity: 0.3,
          strokeWidth: 2,
          trailLength: 180,
          currentTime: this.state.time
        })
      )
    ).filter(Boolean);

    return (
      <DeckGL {...viewport} layers={ layers }
        blending={BLENDING}
       />
    );
  }
}
