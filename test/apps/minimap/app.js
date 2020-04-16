/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {View, MapView} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

const VIEWS = [
  new MapView({
    id: 'main',
    controller: true
  }),
  new MapView({
    id: 'minimap',

    // Position on top of main map
    x: '65%',
    y: '5%',
    width: '30%',
    height: '30%',

    // Minimap is overlaid on top of an existing view, so need to clear the background
    clear: true,

    controller: {
      maxZoom: 11,
      minZoom: 11,
      dragRotate: false,
      keyboard: false
    }
  })
];

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      viewState: {
        main: {
          longitude: -74.01,
          latitude: 40.705,
          zoom: 15,
          pitch: 45,
          bearing: 0
        },
        minimap: {
          longitude: -74.01,
          latitude: 40.705,
          zoom: 11,
          pitch: 0,
          bearing: 0
        }
      }
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 1800, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _onViewStateChange({viewState, viewId}) {
    const oldViewState = this.state.viewState;
    if (viewId === 'minimap') {
      this.setState({
        viewState: {
          main: {
            ...oldViewState.main,
            longitude: viewState.longitude,
            latitude: viewState.latitude
          },
          minimap: viewState
        }
      });
    } else {
      this.setState({
        viewState: {
          main: viewState,
          minimap: {
            ...oldViewState.minimap,
            longitude: viewState.longitude,
            latitude: viewState.latitude
          }
        }
      });
    }
  }

  _renderLayers() {
    const {buildings = DATA_URL.BUILDINGS, trips = DATA_URL.TRIPS, trailLength = 180} = this.props;

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: [253, 128, 93],
        getWidth: 5,
        lineWidthMinPixels: 2,
        trailLength,
        currentTime: this.state.time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: buildings,
        extruded: true,
        wireframe: false,
        opacity: 1,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: [74, 80, 87]
      })
    ];
  }

  render() {
    return (
      <DeckGL
        layers={this._renderLayers()}
        viewState={this.state.viewState}
        views={VIEWS}
        onViewStateChange={this._onViewStateChange}
      >
        <StaticMap
          reuseMaps
          mapStyle="mapbox://styles/mapbox/dark-v9"
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
        <View id="minimap">
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/light-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </View>
      </DeckGL>
    );
  }
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
