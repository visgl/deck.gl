/* eslint-disable func-style */
/* eslint-disable no-console */
/* global console */

import 'babel-polyfill';
import document from 'global/document';
import window from 'global/window';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import MapboxGLMap from 'react-map-gl';
import request from 'd3-request';
import {
  WebGLOverlay,
  ChoroplethLayer,
  ScatterplotLayer
} from '../src';

// ---- Default Settings ---- //
const MAPBOX_ACCESS_TOKEN = 'PUT_YOUR_TOKEN_HERE';

const INITIAL_STATE = {
  mapState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5
  },
  choropleths: null,
  points: null
};

// ---- Action ---- //
function updateMap(mapState) {
  return {
    type: 'UPDATE_MAP',
    mapState
  };
}

function loadChoropleths(choropleths) {
  return {
    type: 'LOAD_CHOROPLETHS',
    choropleths
  };
}

function loadPoints(points) {
  return {
    type: 'LOAD_POINTS',
    points
  };
}

// ---- Reducer ---- //
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'UPDATE_MAP':
    return {...state, mapState: action.mapState};
  case 'LOAD_CHOROPLETHS':
    return {...state, choropleths: action.choropleths};
  case 'LOAD_POINTS':
    return {...state, points: action.points};
  default:
    return state;
  }
}

// redux states -> react props
function mapStateToProps(state) {
  return {
    mapState: state.mapState,
    choropleths: state.choropleths,
    points: state.points
  };
}

// ---- View ---- //
class ExampleApp extends React.Component {
  constructor(props) {
    super(props);

    this._handleMapUpdate = this._handleMapUpdate.bind(this);

    this._handleChoroplethsLoaded = this._handleChoroplethsLoaded.bind(this);
    this._handleChoroplethHovered = this._handleChoroplethHovered.bind(this);
    this._handleChoroplethClicked = this._handleChoroplethClicked.bind(this);
    this._handlePointsLoaded = this._handlePointsLoaded.bind(this);

    this._renderOverlay = this._renderOverlay.bind(this);
    this._renderMap = this._renderMap.bind(this);
  }

  componentWillMount() {
    this._loadJsonFile('./data/sf.zip.geo.json', this._handleChoroplethsLoaded);
    this._loadCsvFile('./data/sf.bike.parking.csv', this._handlePointsLoaded);
  }

  _loadJsonFile(path, onDataLoaded) {
    request.json(path, function loadJson(error, data) {
      if (error) {
        console.error(error);
      }
      onDataLoaded(data);
    });
  }

  _loadCsvFile(path, onDataLoaded) {
    request.csv(path, function loadJson(error, data) {
      if (error) {
        console.error(error);
      }
      onDataLoaded(data);
    });
  }

  _handleMapUpdate(mapState) {
    this.props.dispatch(updateMap(mapState));
  }

  _handleChoroplethsLoaded(data) {
    this.props.dispatch(loadChoropleths(data));
  }

  _handleChoroplethHovered(choroplethsProps, e) {
    console.log(choroplethsProps.name);
  }

  _handleChoroplethClicked(choroplethsProps, e) {
    console.log(choroplethsProps.name);
  }

  _handlePointsLoaded(data) {
    this.props.dispatch(loadPoints(data));
  }

  // data dependent conversion
  _convertCoordinates(coordString) {
    const p0 = coordString.indexOf('(') + 1;
    const p1 = coordString.indexOf(')');
    const coords = coordString.slice(p0, p1).split(',');
    return {
      x: Number(coords[0]),
      y: Number(coords[1]),
      z: 10
    };
  }

  _renderChoroplethLayer() {
    const {mapState, choropleths} = this.props;
    return new ChoroplethLayer({
      id: 'choroplethLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      data: choropleths,
      mapState: mapState,
      drawContour: true,
      onChoroplethHovered: this._handleChoroplethHovered,
      onChoroplethClicked: this._handleChoroplethClicked
    });
  }

  _renderScatterplotLayer() {
    const {mapState, points} = this.props;

    return new ScatterplotLayer({
      id: 'scatterplotLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      mapState: mapState,
      layerIndex: 2,
      data: points.map(point => {
        const coordString = point.COORDINATES;
        const p0 = coordString.indexOf('(') + 1;
        const p1 = coordString.indexOf(')');
        const coords = coordString.slice(p0, p1).split(',');
        return {
          position: {
            x: Number(coords[0]),
            y: Number(coords[1]),
            z: 10
          },
          color: [35, 81, 128]
        };
      })
    });
  }

  _renderOverlay() {
    const {mapState, choropleths, points} = this.props;

    // wait until data is ready before rendering
    if (!choropleths || !points) {
      return [];
    }

    return (
      <WebGLOverlay
        width={window.innerWidth}
        height={window.innerHeight}
        mapState={mapState}
        layers={[
          this._renderScatterplotLayer(),
          this._renderChoroplethLayer()
        ]}
      />
    );
  }

  _renderMap() {
    const {mapState} = this.props;

    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={window.innerWidth}
        height={window.innerHeight}
        latitude={mapState.latitude}
        longitude={mapState.longitude}
        zoom={mapState.zoom}
        startDragLngLat={mapState.startDragLngLat}
        onChangeViewport={this._handleMapUpdate}
        isDragging={mapState.isDragging}>
        { this._renderOverlay() }
      </MapboxGLMap>
    );
  }

  render() {
    return (
      <div>
        { this._renderMap() }
      </div>
    );
  }
}

// ---- Main ---- //
const store = createStore(reducer);
const App = connect(mapStateToProps)(ExampleApp);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

/* eslint-enable func-style */
/* eslint-enable no-console */
