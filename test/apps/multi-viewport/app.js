/* global document, fetch */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';

import DeckGL, {
  COORDINATE_SYSTEM,
  PolygonLayer,
  PointCloudLayer,
  MapView,
  FirstPersonView,
  ThirdPersonView
} from 'deck.gl';

import TripsLayer from '../../../examples/website/trips/trips-layer';

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const LIGHT_SETTINGS = {
  lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
  ambientRatio: 0.05,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [3.0, 0.0, 0.5, 0.0],
  numberOfLights: 2
};

const DEFAULT_VIEWPORT_PROPS = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  maxZoom: 16,
  pitch: 60,
  bearing: 270,

  // view matrix arguments
  position: [0, 0, 2], // Defines eye position
  // direction: [-0.9, 0.5, 0], // Which direction is camera looking at, default origin
  up: [0, 0, 1] // Defines up direction, default positive y axis
};

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: DEFAULT_VIEWPORT_PROPS.position,
      buildings: null,
      trips: null,
      time: 0,
      trailLength: 50
    };

    fetch(DATA_URL.BUILDINGS)
      .then(response => response.json())
      .then(data => this.setState({buildings: data}));

    fetch(DATA_URL.TRIPS)
      .then(response => response.json())
      .then(data => this.setState({trips: data}));

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onViewStateChange({viewId, viewState}) {
    if (viewId === '3rd-person') {
      this.setState({
        position: viewState.position
      });
    }
  }

  _onValueChange(settingName, newValue) {
    this.setState({
      [settingName]: newValue
    });
  }

  _renderLayers() {
    const {longitude, latitude} = DEFAULT_VIEWPORT_PROPS;
    const {position} = this.state;

    const {buildings, trips} = this.state;
    const {trailLength, time} = this.state;

    return [
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
      }),
      new PointCloudLayer({
        id: 'player',
        data: [
          {
            position,
            color: [0, 255, 255, 255],
            normal: [1, 0, 0]
          }
        ],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 20
      }),
      new PointCloudLayer({
        id: 'ref-point',
        data: [
          {
            position: [-1, 0, 2],
            color: [255, 0, 0, 255],
            normal: [1, 0, 0]
          }
        ],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 20
      })
    ];
  }

  _renderMap({width, height, viewState}) {
    return (
      <StaticMap
        {...viewState}
        width={width}
        height={height}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxApiAccessToken={MAPBOX_TOKEN}
      />
    );
  }

  render() {
    return (
      <DeckGL
        id="first-person"
        width="100%"
        height="100%"
        initialViewState={DEFAULT_VIEWPORT_PROPS}
        onViewStateChange={this._onViewStateChange}
        layers={this._renderLayers()}
      >
        <FirstPersonView id="1st-person" controller={true} height="33.33%" fovy={50} />

        <ThirdPersonView
          id="3rd-person"
          controller={true}
          y="33.33%"
          height="33.33%"
          near={1}
          far={10000}
        >
          {this._renderMap}
        </ThirdPersonView>

        <MapView id="basemap" controller={true} y="66.67%" height="33.33%">
          {this._renderMap}
        </MapView>
      </DeckGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
