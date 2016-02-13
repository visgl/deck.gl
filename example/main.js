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
  HexagonLayer,
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  GridLayer
} from '../src';

// ---- Default Settings ---- //
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

const INITIAL_STATE = {
  viewport: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5
  },
  choropleths: null,
  hexagons: null,
  points: null
};

// ---- Action ---- //
function updateMap(viewport) {
  return {type: 'UPDATE_MAP', viewport};
}

function loadChoropleths(choropleths) {
  return {type: 'LOAD_CHOROPLETHS', choropleths};
}

function loadHexagons(hexagons) {
  return {type: 'LOAD_HEXAGONS', hexagons};
}

function loadPoints(points) {
  return {type: 'LOAD_POINTS', points};
}

// ---- Reducer ---- //
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'UPDATE_MAP':
    return {...state, viewport: action.viewport};
  case 'LOAD_CHOROPLETHS':
    return {...state, choropleths: action.choropleths};
  case 'LOAD_HEXAGONS':
    return {...state, hexagons: action.hexagons};
  case 'LOAD_POINTS': {
    const points = action.points.map(point => {
      const coordString = point.COORDINATES;
      const p0 = coordString.indexOf('(') + 1;
      const p1 = coordString.indexOf(')');
      const coords = coordString.slice(p0, p1).split(',');
      return {
        position: {
          x: Number(coords[1]),
          y: Number(coords[0]),
          z: 10
        },
        color: [88, 9, 124]
      };
    });

    return {...state, points};
  }

  default:
    return state;
  }
}

// redux states -> react props
function mapStateToProps(state) {
  return {
    viewport: state.viewport,
    choropleths: state.choropleths,
    hexagons: state.hexagons,
    points: state.points
  };
}

// ---- View ---- //
class ExampleApp extends React.Component {
  constructor(props) {
    super(props);

    this._handleViewportChanged = this._handleViewportChanged.bind(this);

    this._handleChoroplethsLoaded = this._handleChoroplethsLoaded.bind(this);
    this._handleChoroplethHovered = this._handleChoroplethHovered.bind(this);
    this._handleChoroplethClicked = this._handleChoroplethClicked.bind(this);

    this._handleHexagonsLoaded = this._handleHexagonsLoaded.bind(this);
    this._handleHexagonHovered = this._handleHexagonHovered.bind(this);
    this._handleHexagonClicked = this._handleHexagonClicked.bind(this);

    this._handlePointsLoaded = this._handlePointsLoaded.bind(this);

    this._renderOverlay = this._renderOverlay.bind(this);
    this._renderMap = this._renderMap.bind(this);
  }

  componentWillMount() {
    this._loadJsonFile('./data/sf.zip.geo.json', this._handleChoroplethsLoaded);
    this._loadCsvFile('./data/hexagons.csv', this._handleHexagonsLoaded);
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

  _handleViewportChanged(viewport) {
    this.props.dispatch(updateMap(viewport));
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

  _handleHexagonHovered(...args) {
    console.log(...args);
  }

  _handleHexagonClicked(...args) {
    console.log(...args);
  }

  _handleHexagonsLoaded(data) {
    this.props.dispatch(loadHexagons(data));
  }

  _handlePointsLoaded(data) {
    this.props.dispatch(loadPoints(data));
  }

  _renderGridLayer() {
    const {viewport, points} = this.props;

    return new GridLayer({
      id: 'gridLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      layerIndex: 0,
      data: points
    });
  }

  _renderChoroplethLayer() {
    const {viewport, choropleths} = this.props;

    return new ChoroplethLayer({
      id: 'choroplethLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      data: choropleths,
      isPickable: false,
      drawContour: true,
      layerIndex: 1
    });
  }

  _renderHexagonLayer() {
    const {viewport, hexagons} = this.props;

    const values = hexagons.map(hexagon => Number(hexagon.value));
    const maxValue = Math.max(...values);

    const data = hexagons.map(hexagon => ({
      centroid: {
        x: Number(hexagon['centroid.x']),
        y: Number(hexagon['centroid.y'])
      },
      vertices: [
        [Number(hexagon['v0.x']), Number(hexagon['v0.y'])],
        [Number(hexagon['v1.x']), Number(hexagon['v1.y'])],
        [Number(hexagon['v2.x']), Number(hexagon['v2.y'])],
        [Number(hexagon['v3.x']), Number(hexagon['v3.y'])],
        [Number(hexagon['v4.x']), Number(hexagon['v4.y'])],
        [Number(hexagon['v5.x']), Number(hexagon['v5.y'])]
      ],
      color: [
        Number(hexagon.value) / maxValue * 255,
        Number(hexagon.value) / maxValue * 128,
        Number(hexagon.value) / maxValue * 64
      ]
    }));

    return new HexagonLayer({
      id: 'hexagonLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      data,
      isPickable: true,
      layerIndex: 2,
      onHexagonHovered: this._handleHexagonHovered,
      onHexagonClicked: this._handleHexagonClicked
    });
  }

  _renderScatterplotLayer() {
    const {viewport, points} = this.props;

    return new ScatterplotLayer({
      id: 'scatterplotLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      layerIndex: 3,
      data: points
    });
  }

  _renderArcLayer() {
    const {viewport, points} = this.props;

    return new ArcLayer({
      id: 'arcLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      layerIndex: 4,
      data: points.map((point, i) => {
        if (i === points.length - 1) {
          return {
            position: {x0: 0, y0: 0, x1: 0, y1: 0},
            color: [35, 81, 128]
          };
        }

        const source = point;
        const target = points[i + 1];

        return {
          position: {
            x0: source.position.x, y0: source.position.y,
            x1: target.position.x, y1: target.position.y
          },
          colors: {
            c0: [255, 0, 0], c1: [0, 0, 255]
          }
        };
      })
    });
  }

  _renderOverlay() {
    const {choropleths, hexagons, points} = this.props;

    // wait until data is ready before rendering
    if (!choropleths || !points || !hexagons) {
      return [];
    }

    return (
      <WebGLOverlay
        width={window.innerWidth}
        height={window.innerHeight}
        layers={[
          this._renderGridLayer(),
          this._renderChoroplethLayer(),
          // this._renderHexagonLayer(),
          this._renderScatterplotLayer()
          // this._renderArcLayer()
        ]}
      />
    );
  }

  _renderMap() {
    const {viewport} = this.props;

    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={window.innerWidth}
        height={window.innerHeight}
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        startDragLngLat={viewport.startDragLngLat}
        onChangeViewport={this._handleViewportChanged}
        isDragging={viewport.isDragging}>
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
