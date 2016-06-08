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
import {Mat4} from 'luma.gl';
import OverlayControl from './overlay-control';

import request from 'd3-request';
import {
  DeckGLOverlay,
  HexagonLayer,
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  GridLayer
} from '../src';

// ---- Default Settings ---- //
/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ||
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

const CHOROPLETHS_FILE = './example/data/sf.zip.geo.json';
const HEXAGONS_FILE = './example/data/hexagons.csv';
const POINTS_FILE = './example/data/sf.bike.parking.csv';

const INITIAL_STATE = {
  mapViewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5
  },
  choropleths: null,
  hexagons: null,
  points: null,
  arcs: null,
  arcs2: null,
  arcStrokeWidth: 1
};

// ---- Action ---- //
function updateMap(mapViewState) {
  return {type: 'UPDATE_MAP', mapViewState};
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
    return {...state, mapViewState: action.mapViewState};
  case 'LOAD_CHOROPLETHS':
    return {...state, choropleths: action.choropleths};
  case 'LOAD_HEXAGONS':
    const {hexagons} = action;
    const hexData = processHexagons(hexagons);
    return {...state, hexagons, hexData};
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
          z: 0
        },
        color: [88, 9, 124]
      };
    });

    const arcs = pointsToArcs(points);
    const arcs1 = arcs.slice(0, arcs.length / 2);
    const arcs2 = arcs.slice(arcs.length / 2);
    return {...state, points, arcs: arcs1, arcs2};
  }

  default:
    return state;
  }
}

// redux states -> react props
function mapStateToProps(state) {
  return {
    mapViewState: state.mapViewState,
    choropleths: state.choropleths,
    hexagons: state.hexagons,
    points: state.points,
    arcs: state.arcs,
    arcs2: state.arcs2,
    hexData: state.hexData
  };
}

// ---- Helpers ---- //

function processHexagons(hexagons) {
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
    ],
    elevation: Number(hexagon.value) / maxValue * 100

  }));
  return data;
}

function pointsToArcs(points) {
  return points.map((point, i) => {
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
  });
}

// ---- View ---- //
class ExampleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedHexagons: [],
      hoverItem: null,
      clickItem: null
    };
  }

  componentWillMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);

    this._loadJsonFile(CHOROPLETHS_FILE, this._handleChoroplethsLoaded);
    this._loadCsvFile(HEXAGONS_FILE, this._handleHexagonsLoaded);
    this._loadCsvFile(POINTS_FILE, this._handlePointsLoaded);
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

  _loadCsvFile(path, onDataLoaded) {
    request.csv(path, function loadJson(error, data) {
      if (error) {
        console.error(error);
      }
      onDataLoaded(data);
    });
  }

  @autobind _updateArcStrokeWidth() {
    this.setState({arcStrokeWidth: 1});
  }

  @autobind _handleHexagonsLoaded(data) {
    this.props.dispatch(loadHexagons(data));
  }

  @autobind _handlePointsLoaded(data) {
    this.props.dispatch(loadPoints(data));
  }

  @autobind _handleChoroplethsLoaded(data) {
    this.props.dispatch(loadChoropleths(data));
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

  @autobind _handleChoroplethHovered(info) {
    info.type = 'choropleth';
    this.setState({hoverItem: info});
  }

  @autobind _handleChoroplethClicked(info) {
    info.type = 'choropleth';
    this.setState({clickItem: info});
  }

  @autobind _handleHexagonHovered(info) {
    info.type = 'hexagon';

    const {hexData} = this.props;
    let selectedHexagons = [];
    if (info.index >= 0) {
      selectedHexagons = [{
        ...hexData[info.index],
        color: [0, 0, 255]
      }];
    }

    // this.setState({
    //   hoverItem: info,
    //   selectedHexagons
    // });
  }

  @autobind _handleHexagonClicked(info) {
    // info.type = 'hexagon';
    // this.setState({clickItem: info});
  }

  @autobind _handleScatterplotHovered(info) {
    info.type = 'point';
    this.setState({hoverItem: info});
  }

  @autobind _handleScatterplotClicked(info) {
    info.type = 'point';
    this.setState({clickItem: info});
  }

  @autobind _handleArcHovered(info) {
    info.type = 'arc';
    this.setState({hoverItem: info});
  }

  @autobind _handleArcClicked(info) {
    info.type = 'arc';
    this.setState({clickItem: info});
  }

  _renderGridLayer() {
    const {mapViewState, points} = this.props;

    return new GridLayer({
      id: 'gridLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      isPickable: false,
      opacity: 0.06,
      data: points
    });
  }

  _renderChoroplethLayer() {
    const {mapViewState, choropleths} = this.props;
    return new ChoroplethLayer({
      id: 'choroplethLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: choropleths,
      opacity: 0.8,
      isPickable: false,
      drawContour: true,
      onHover: this._handleChoroplethHovered,
      onClick: this._handleChoroplethClicked
    });
  }

  _renderHexagonLayer() {
    const {mapViewState, hexData} = this.props;

    return new HexagonLayer({
      id: 'hexagonLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: hexData,
      opacity: 0.5,
      elevation: 10,
      isPickable: true,
      onHover: this._handleHexagonHovered,
      onClick: this._handleHexagonClicked
    });
  }

  _renderHexagonSelectionLayer() {
    const {mapViewState} = this.props;
    const {selectedHexagons} = this.state;

    return new HexagonLayer({
      id: 'hexagonSelectionLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: selectedHexagons,
      opacity: 0.1,
      elevation: 10,
      isPickable: true,
      onHover: this._handleHexagonHovered,
      onClick: this._handleHexagonClicked
    });
  }

  _renderScatterplotLayer() {
    const {mapViewState, points} = this.props;

    return new ScatterplotLayer({
      id: 'scatterplotLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: points,
      isPickable: true,
      onHover: this._handleScatterplotHovered,
      onClick: this._handleScatterplotClicked
    });
  }

  _renderArcLayer() {
    const {mapViewState, arcs} = this.props;

    return new ArcLayer({
      id: 'arcLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: arcs,
      strokeWidth: this.state.arcStrokeWidth || 1,
      color0: [0, 0, 255],
      color1: [0, 0, 255],
      isPickable: true,
      onHover: this._handleArcHovered,
      onClick: this._handleArcClicked
    });
  }

  _renderArcLayer2() {
    const {mapViewState, arcs2} = this.props;

    return new ArcLayer({
      id: 'arcLayer2',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      zoom: mapViewState.zoom,
      data: arcs2,
      strokeWidth: this.state.arcStrokeWidth || 1,
      color0: [0, 255, 0],
      color1: [0, 255, 0],
      isPickable: true,
      onHover: this._handleArcHovered,
      onClick: this._handleArcClicked
    });
  }

  _renderOverlay() {
    const {choropleths, hexagons, points, mapViewState} = this.props;
    const {width, height} = this.state;

    // wait until data is ready before rendering
    if (!choropleths || !points || !hexagons) {
      return [];
    }

    // TODO - we should just pass mapViewState to DeckGL, no need to mention
    // the projectionMatrix.

    return (
      <DeckGLOverlay
        width={width}
        height={height}
        {...mapViewState}
        layers={[
          this._renderGridLayer(),
          this._renderHexagonLayer(),
          this._renderHexagonSelectionLayer(),
          this._renderArcLayer(),
          this._renderArcLayer2(),
          this._renderScatterplotLayer(),
          this._renderChoroplethLayer()
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
        perspectiveEnabled
        { ...mapViewState }
        onChangeViewport={this._handleViewportChanged}>
        { this._renderOverlay() }
      </MapboxGLMap>
    );
  }

  render() {
    const {hoverItem, clickItem} = this.state;

    return (
      <div>
        { this._renderMap() }

        <OverlayControl
          hoverItem={ hoverItem }
          clickItem={ clickItem }/>

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
