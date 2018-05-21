/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {MapView, PolygonLayer} from 'deck.gl';
import TripsLayer from './trips-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

const LIGHT_SETTINGS = {
  lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
  ambientRatio: 0.05,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [2.0, 0.0, 0.0, 0.0],
  numberOfLights: 2
};

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...App.defaultViewport,
        width: 500,
        height: 500
      },
      buildings: null,
      trips: null,
      time: 0
    };

    fetch(DATA_URL.BUILDINGS)
      .then(resp => resp.json())
      .then(data => this.setState({buildings: data}));

    fetch(DATA_URL.TRIPS)
      .then(resp => resp.json())
      .then(data => this.setState({trips: data}));
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const timestamp = Date.now();
    const loopLength = 1800;
    const loopTime = 60000;

    this.setState({
      time: (timestamp % loopTime) / loopTime * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _resize() {
    const viewState = Object.assign(this.state.viewState, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    this._onViewStateChange({viewState});
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  render() {
    const {
      buildings = DATA_URL.BUILDINGS,
      trips = DATA_URL.TRIPS,
      trailLength = 180,
      time = this.state.time,

      onViewStateChange = this._onViewStateChange.bind(this),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = "mapbox://styles/mapbox/dark-v9"
    } = this.props;

    const layers = [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.3,
        strokeWidth: 2,
        trailLength,
        currentTime: time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: buildings,
        extruded: true,
        wireframe: false,
        fp64: true,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: f => [74, 80, 87],
        lightSettings: LIGHT_SETTINGS
      })
    ];

    return (
      <MapGL
        {...viewState}
        reuseMap
        onViewportChange={viewport => onViewStateChange({viewState: viewport})}
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
      >

        <DeckGL
          layers={layers}
          views={new MapView({id: 'map'})}
          viewState={viewState}
          />;

      </MapGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
