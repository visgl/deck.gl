/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/layers';
import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

const transitionInterpolator = new LinearInterpolator(['bearing']);

const INITIAL_VIEW_STATE = {
  longitude: -1.4157267858730052,
  latitude: 52.232395363869415,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: 0
};

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const COLOR_RANGE = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

class Root extends Component {
  constructor(props) {
    super(props);
    this.rotationStep = 0;
    this.state = {
      viewState: INITIAL_VIEW_STATE,
      data: null
    };

    this._onLoad = this._onLoad.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);

    requestCsv(DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => [Number(d.lng), Number(d.lat)]);
        this.setState({data});
      }
    });
  }

  _onLoad() {
    this._rotateCamera();
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _rotateCamera() {
    const angleDelta = 120.0;
    const bearing = this.state.viewState.bearing + angleDelta;
    this.setState({
      viewState: {
        ...this.state.viewState,
        bearing,
        transitionDuration: angleDelta * 35,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _renderLayers() {
    const {data} = this.state;

    return [
      data &&
        new HexagonLayer({
          id: 'heatmap',
          colorRange: COLOR_RANGE,
          data,
          elevationRange: [0, 3000],
          elevationScale: 50,
          extruded: true,
          getPosition: d => d,
          lightSettings: LIGHT_SETTINGS,
          opacity: 1,
          radius: 1000,
          upperPercentile: 100,
          coverage: 1
        })
    ];
  }

  render() {
    const {viewState} = this.state;
    return (
      <DeckGL
        layers={this._renderLayers()}
        viewState={viewState}
        onLoad={this._onLoad}
        onViewStateChange={this._onViewStateChange}
        controller={true}
      >
        <StaticMap mapStyle="mapbox://styles/mapbox/dark-v9" mapboxApiAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
