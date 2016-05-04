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
import request from 'd3-request';
import {
  DeckGLOverlay,
  HexagonLayer,
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  GridLayer
} from '../src';
import flatWorld, {getProjectionMatrix} from '../src/flat-world';
import {Mat4} from 'luma.gl';

// ---- Default Settings ---- //
/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ||
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

const INITIAL_STATE = {
  viewport: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    projectionMatrix: new Mat4()
  },
  choropleths: null,
  hexagons: null,
  points: null,
  arcs: null,
  arcStrokeWidth: 1
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

    return {...state, points, arcs: pointsToArcs(points)};
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
    points: state.points,
    arcs: state.arcs,
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
    ]
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
  }

  componentWillMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);

    this._loadJsonFile('./data/sf.zip.geo.json', this._handleChoroplethsLoaded);
    this._loadCsvFile('./data/hexagons.csv', this._handleHexagonsLoaded);
    this._loadCsvFile('./data/sf.bike.parking.csv', this._handlePointsLoaded);
  }

  componentDidMount() {
    // update arc stroke width
    window.setTimeout(this._updateArcStrokeWidth, 3000);
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

  @autobind
  _updateArcStrokeWidth() {
    console.log('update arc stroke width');
    this.setState({arcStrokeWidth: 1});
  }

  @autobind
  _handleHexagonsLoaded(data) {
    this.props.dispatch(loadHexagons(data));
  }

  @autobind
  _handlePointsLoaded(data) {
    this.props.dispatch(loadPoints(data));
  }

  @autobind
  _handleChoroplethsLoaded(data) {
    this.props.dispatch(loadChoropleths(data));
  }

  @autobind
  _handleResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  @autobind
  _handleViewportChanged(viewport) {
    this.props.dispatch(updateMap(viewport));
  }

  @autobind
  _handleChoroplethHovered(info) {
    // console.log('choropleth hovered:', info);
  }

  @autobind
  _handleChoroplethClicked(info) {
    // console.log('choropleth clicked:', info);
  }

  @autobind
  _handleHexagonHovered(info) {
    // console.log('Hexagon hovered:', info);
  }

  @autobind
  _handleHexagonClicked(info) {
    // console.log('Hexagon clicked:', info);
  }

  @autobind
  _handleScatterplotHovered(info) {
    // console.log('Scatterplot hovered:', info);
  }

  @autobind
  _handleScatterplotClicked(info) {
    // console.log('Scatterplot clicked:', info);
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
      isPickable: false,
      opacity: 0.06,
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
      opacity: 0.8,
      isPickable: false,
      drawContour: true,
      onHover: this._handleChoroplethHovered,
      onClick: this._handleChoroplethClicked
    });
  }

  _renderHexagonLayer() {
    const {viewport, hexData} = this.props;

    return new HexagonLayer({
      id: 'hexagonLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      data: hexData,
      isPickable: true,
      opacity: 0.1,
      onHover: this._handleHexagonHovered,
      onClick: this._handleHexagonClicked
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
      isPickable: false,
      data: points,
      onHover: this._handleScatterplotHovered,
      onClick: this._handleScatterplotClicked
    });
  }

  _renderArcLayer() {

    const {viewport, arcs} = this.props;

    return new ArcLayer({
      id: 'arcLayer',
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      zoom: viewport.zoom,
      data: arcs,
      strokeWidth: this.state.arcStrokeWidth || 1
    });
  }

  _renderOverlay() {
    const {choropleths, hexagons, points, viewport} = this.props;
    const {width, height} = this.state;

    // wait until data is ready before rendering
    if (!choropleths || !points || !hexagons) {
      return [];
    }

    // const {projectionMatrix} = viewport;
    // const projectionMatrix = getProjectionMatrix(viewport);
    const camera = flatWorld.getCamera({
      ...viewport,
      projectionMatrix: new Mat4(viewport.projectionMatrix),
      width,
      height
    });
    return (
      <DeckGLOverlay
        camera={camera}
        width={width}
        height={height}
        layers={[
          // this._renderGridLayer(),
          // this._renderChoroplethLayer(),
          this._renderHexagonLayer(),
          // this._renderScatterplotLayer(),
          // this._renderArcLayer()
        ]}
      />
    );
  }

  _renderMap() {
    const {viewport} = this.props;
    const {width, height} = this.state;

    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={width}
        height={height}
        perspectiveEnabled={true}
        { ...viewport }
        onChangeViewport={this._handleViewportChanged}>
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
