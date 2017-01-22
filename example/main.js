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
/* global document, window */
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import autobind from 'autobind-decorator';

import MapboxGLMap from 'react-map-gl';
import {FPSStats} from 'react-stats';
import LayerSelector from './layer-selector';
import LayerInfo from './layer-info';

import * as request from 'd3-request';
import LAYER_CATEGORIES, {DEFAULT_ACTIVE_LAYERS} from './layer-examples';

import DeckGL from '../src/react/deckgl';
import {ReflectionEffect, ShadowEffect} from '../src/experimental';

// ---- Default Settings ---- //
/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ||
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

const CHOROPLETHS_FILE = './example/data/sf.zip.geo.json';
const EXTRUDED_CHOROPLETHS_FILE = './example/data/sf.zip.geo.json';
const HEXAGONS_FILE = './example/data/hexagons.csv';
const POINTS_FILE = './example/data/sf.bike.parking.csv';

const INITIAL_STATE = {
  mapViewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  choropleths: null,
  extrudedChoropleths: null,
  hexagons: null,
  points: null,
  arcs: null,
  arcs2: null,
  lines: null,
  arcStrokeWidth: 1
};

// ---- Action ---- //
function updateMap(mapViewState) {
  return {type: 'UPDATE_MAP', mapViewState};
}

function loadChoropleths(choropleths) {
  return {type: 'LOAD_CHOROPLETHS', choropleths};
}

function loadExtrudedChoropleths(extrudedChoropleths) {
  return {type: 'LOAD_EXTRUDED_CHOROPLETHS', extrudedChoropleths};
}

function loadHexagons(hexagons) {
  return {type: 'LOAD_HEXAGONS', hexagons};
}

function loadPoints(points) {
  return {type: 'LOAD_POINTS', points};
}

// Swaps data props when clicked to trigger WebGLBuffer updates
function swapData() {
  return {type: 'SWAP_DATA'};
}

// ---- Reducer ---- //
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'UPDATE_MAP':
    return {...state, mapViewState: action.mapViewState};
  case 'LOAD_CHOROPLETHS':
    return {...state, choropleths: action.choropleths};
  case 'LOAD_EXTRUDED_CHOROPLETHS':
    return {...state, extrudedChoropleths: action.extrudedChoropleths};
  case 'LOAD_HEXAGONS': {
    const {hexagons} = action;
    const hexData2 = processHexagons(hexagons);
    const hexData = hexData2.slice(hexData2.length / 2);
    return {...state, hexagons, hexData, hexData2};
  }
  case 'LOAD_POINTS': {
    const points = action.points.map(point => {
      const coordString = point.COORDINATES;
      const p0 = coordString.indexOf('(') + 1;
      const p1 = coordString.indexOf(')');
      const coords = coordString.slice(p0, p1).split(',');
      return {
        position: [Number(coords[1]), Number(coords[0]), 0],
        color: [88, 9, 124],
        radius: (Math.random() * (15 - 5 + 1) + 5) / 10
      };
    });

    const arcs = pointsToArcs(points);
    const arcs1 = arcs.slice(0, arcs.length / 2);
    const arcs2 = arcs.slice(arcs.length / 2);
    const lines = pointsToLines(points);
    return {...state, points, arcs: arcs1, arcs2, lines};
  }
  case 'SWAP_DATA': {
    state = {
      ...state,
      hexData: state.hexData2,
      hexData2: state.hexData
    };
    return state;
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
    extrudedChoropleths: state.extrudedChoropleths,
    hexagons: state.hexagons,
    points: state.points,
    arcs: state.arcs,
    arcs2: state.arcs2,
    lines: state.lines,
    hexData: state.hexData,
    hexData2: state.hexData2
  };
}

// ---- Helpers ---- //

function processHexagons(hexagons) {
  const values = hexagons.map(hexagon => Number(hexagon.value));
  const maxValue = Math.max(...values);

  const data = hexagons.map(hexagon => ({
    centroid: [
      hexagon['centroid.x'],
      hexagon['centroid.y']
    ],
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
    elevation: Number(hexagon.value) / maxValue

  }));
  return data;
}

function pointsToArcs(points) {
  return points.map((point, i) => {
    if (i === points.length - 1) {
      return {
        sourcePosition: [0, 0],
        targetPosition: [0, 0],
        color: [35, 81, 128]
      };
    }

    const source = point;
    const target = points[i + 1];

    return {
      sourcePosition: source.position,
      targetPosition: target.position,
      color: [
        i % 255,
        255 - i % 255,
        Math.floor(i / 255) % 255,
        255
      ]
    };
  });
}

function pointsToLines(points) {
  return points.map((point, i) => {
    if (i === points.length - 1) {
      return {
        sourcePosition: [0, 0, 0],
        targetPosition: [0, 0, 0],
        color: [35, 81, 128]
      };
    }

    const source = point;
    const target = points[i + 1];

    return {
      sourcePosition: [
        source.position[0],
        source.position[1],
        Math.random() * 1000
      ],
      targetPosition: [
        target.position[0],
        target.position[1],
        Math.random() * 1000
      ],
      color: [0, 0, 255]
    };
  });
}

// ---- View ---- //
class ExampleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeExamples: DEFAULT_ACTIVE_LAYERS,
      selectedHexagons: [],
      hoverHexagon: null,
      hoverPoint: null,
      hoverArc: null,
      hoverChoropleth: null,
      clickItem: null
    };

    this._effects = [
      new ReflectionEffect(),
      new ShadowEffect({})
    ];
  }

  componentWillMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);

    this._loadJsonFile(CHOROPLETHS_FILE, this._handleChoroplethsLoaded);
    this._loadJsonFile(EXTRUDED_CHOROPLETHS_FILE, this._handleExtrudedChoroplethsLoaded);
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

  @autobind _handleExtrudedChoroplethsLoaded(data) {
    this.props.dispatch(loadExtrudedChoropleths(data));
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
    this.setState({hoverChoropleth: info});
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

    this.setState({
      hoverHexagon: info,
      selectedHexagons
    });
  }

  @autobind _handleHexagonClicked(info) {
    info.type = 'hexagon';
    this.setState({clickItem: info});
    this.props.dispatch(swapData());
  }

  @autobind _handleScatterplotHovered(info) {
    info.type = 'point';
    this.setState({hoverPoint: info});
  }

  @autobind _handleScatterplotClicked(info) {
    info.type = 'point';
    this.setState({clickItem: info});
  }

  @autobind _handleArcHovered(info) {
    info.type = 'arc';
    this.setState({hoverArc: info});
  }

  @autobind _handleArcClicked(info) {
    info.type = 'arc';
    this.setState({clickItem: info});
  }

  @autobind _handleLineHovered(info) {
    info.type = 'line';
    this.setState({hoverLine: info});
  }

  @autobind _handleLineClicked(info) {
    info.type = 'line';
    this.setState({clickItem: info});
  }

  @autobind _onChangeLayers(exampleName) {
    const {activeExamples} = this.state;
    activeExamples[exampleName] = !activeExamples[exampleName];
    this.setState({activeExamples});
  }

  @autobind _onWebGLInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _renderExamples() {
    const props = {
      ...this.props,
      ...this.state,
      onChoroplethHovered: this._handleChoroplethHovered,
      onChoroplethClicked: this._handleChoroplethClicked,
      onHexagonHovered: this._handleHexagonHovered,
      onHexagonClicked: this._handleHexagonClicked,
      onScatterplotHovered: this._handleScatterplotHovered,
      onScatterplotClicked: this._handleScatterplotClicked,
      onArcHovered: this._handleArcHovered,
      onArcClicked: this._handleArcClicked,
      onLineHovered: this._handleLineHovered,
      onLineClicked: this._handleLineClicked
    };
    const layers = [];
    for (const categoryName of Object.keys(LAYER_CATEGORIES)) {
      for (const exampleName of Object.keys(LAYER_CATEGORIES[categoryName])) {
        if (this.state.activeExamples[exampleName]) {
          // An example can be a function returning a deck.gl layer instance
          // or an array of such a function and a prop generating function
          let example = LAYER_CATEGORIES[categoryName][exampleName];
          let layerProps = props;
          /* eslint-disable max-depth */
          if (Array.isArray(example)) {
            const makeProps = example[1];
            example = example[0];
            layerProps = {
              ...props,
              ...makeProps(),
              id: exampleName
            };
          }
          /* eslint-enable max-depth */
          layers.push(example(layerProps));
        }
      }
    }
    return layers;
  }

  _renderOverlay() {
    const {choropleths, extrudedChoropleths, hexagons, points, mapViewState} = this.props;
    const {width, height} = this.state;

    // wait until data is ready before rendering
    if (!extrudedChoropleths || !choropleths || !points || !hexagons) {
      return [];
    }

    return (
      <DeckGL
        id="default-deckgl-overlay"
        width={width}
        height={height}
        debug
        {...mapViewState}
        onWebGLInitialized={ this._onWebGLInitialized }
        layers={this._renderExamples()}
        effects={this._effects}
      />
    );
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
        <FPSStats isActive/>
      </MapboxGLMap>
    );
  }

  render() {
    return (
      <div>
        { this._renderMap() }
        <LayerSelector { ...this.state }
          examples={LAYER_CATEGORIES}
          onChange={this._onChangeLayers}/>
        <LayerInfo { ...this.state }/>
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
