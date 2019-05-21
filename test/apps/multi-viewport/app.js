/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';

import DeckGL, {
  COORDINATE_SYSTEM,
  PolygonLayer,
  PointCloudLayer,
  MapView,
  FirstPersonView,
  // ThirdPersonView,
  TripsLayer
} from 'deck.gl';

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
  bearing: 270
};

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 1000,
      trailLength: 50
    };
  }

  _onValueChange(settingName, newValue) {
    this.setState({
      [settingName]: newValue
    });
  }

  _renderLayers() {
    const {longitude, latitude} = DEFAULT_VIEWPORT_PROPS;
    const {trailLength, time} = this.state;

    return [
      new TripsLayer({
        id: 'trips',
        data: DATA_URL.TRIPS,
        getPath: d => d.segments,
        getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.3,
        getWidth: 2,
        widthMinPixels: 2,
        trailLength,
        currentTime: time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: DATA_URL.BUILDINGS,
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
        id: 'ref-point',
        data: [
          {
            position: [0, 0, 2],
            color: [255, 0, 0, 255]
          }
        ],
        getColor: d => d.color,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [longitude, latitude],
        opacity: 1,
        pointSize: 5
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
        layers={this._renderLayers()}
      >
        <FirstPersonView
          id="1st-person"
          controller={true}
          height="50%"
          fovy={50}
          position={[0, 0, 2]}
        />

        <MapView id="basemap" controller={true} y="50%" height="50%" position={[0, 0, 0]}>
          {this._renderMap}
        </MapView>
      </DeckGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
