// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable func-style */
/* eslint-disable no-console */
/* global console, process */
import 'babel-polyfill';
import document from 'global/document';
import window from 'global/window';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import autobind from 'autobind-decorator';

import MapboxGLMap from 'react-map-gl';
import OverlayControl from './overlay-control';

import request from 'd3-request';
import {
  DeckGLOverlay,
  LineLayer
} from '../src';

// ---- Default Settings ---- //
/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ||
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

const GEO_JSON_FILE = './example/data/your.geo.json';
const INITIAL_STATE = {
  mapViewState: {
    latitude: 21.1250,
    longitude: -101.6860,
    zoom: 11.5
  },
  lines: null
};

// ---- Action ---- //
function updateMap(mapViewState) {
  return {type: 'UPDATE_MAP', mapViewState};
}

function loadGeoJson(data) {
  return {type: 'LOAD_GEO_JSON', geoJson: data};
}

function loadPoints(points) {
  return {type: 'LOAD_POINTS', points};
}

// ---- Reducer ---- //
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'UPDATE_MAP':
    return {...state, mapViewState: action.mapViewState};
  case 'LOAD_GEO_JSON':
    const colors = [[255, 0, 0], [0, 128, 0], [0, 0, 255]];
    let i = 0;
    const lines = [];
    action.geoJson.features.forEach(f => {
      i++;
      const coordinates = f.geometry.coordinates;
      let prev = coordinates[0];
      coordinates.slice(1).forEach(c => {
        lines.push({
          position: {
            x0: prev[0],
            y0: prev[1],
            x1: c[0],
            y1: c[1]
          },
          color: colors[i % 3]
        });
        prev = c;
      });
    });
    return {...state, lines};

  default:
    return state;
  }
}

// redux states -> react props
function mapStateToProps(state) {
  return {
    mapViewState: state.mapViewState,
    lines: state.lines
  };
}

// ---- View ---- //
class ExampleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverLine: null
    };
  }

  componentWillMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);

    this._loadJsonFile(GEO_JSON_FILE, this._handleGeoJsonLoaded);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  }

  _loadJsonFile(path, onDataLoaded) {
    request.json(path, function loadJson(error, data) {
      if (error) {
        console.error(error);
      }
      onDataLoaded(data);
    });
  }

  @autobind _handleGeoJsonLoaded(data) {
    this.props.dispatch(loadGeoJson(data));
  }

  @autobind _handleResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  @autobind _handleViewportChanged(mapViewState) {
    if (mapViewState.pitch > 60) {
      mapViewState.pitch = 60;
    }
    this.props.dispatch(updateMap(mapViewState));
  }

  @autobind _handleLineHovered(info) {
    info.type = 'line';
    this.setState({hoverLine: info});
  }

  @autobind _handleLineClicked(info) {
    info.type = 'line';
    this.setState({clickItem: info});
  }

  _renderLineLayer() {
    const {mapViewState, lines} = this.props;

    return new LineLayer({
      id: 'lineLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: lines,
      strokeWidth: this.state.lineStrokeWidth || 1,
      color0: [0, 0, 255],
      color1: [0, 0, 255],
      isPickable: true,
      onHover: this._handleLineHovered,
      onClick: this._handleLineClicked
    });
  }

  _renderOverlay() {
    const {lines, mapViewState} = this.props;
    const {width, height} = this.state;

    if (!lines) {
      return [];
    }

    return (
      <DeckGLOverlay
        width={width}
        height={height}
        {...mapViewState}
        layers={[
          this._renderLineLayer()
        ]}
        onWebGLInitialized={ this._onWebGLInitialized }
      />
    );
  }

  @autobind _onWebGLInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _renderMap() {
    const {mapViewState} = this.props;
    const {width, height} = this.state;

    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={width}
        height={height}
        perspectiveEnabled={true}
        { ...mapViewState }
        onChangeViewport={this._handleViewportChanged}>
        { this._renderOverlay() }
      </MapboxGLMap>
    );
  }

  render() {
    return (
      <div>
        { this._renderMap() }
        <OverlayControl { ...this.state }/>
      </div>
    );
  }
}

// ---- Main ---- //
const store = createStore(reducer);
const App = connect(mapStateToProps)(ExampleApp);

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  container
);

/* eslint-enable func-style */
/* eslint-enable no-console */
