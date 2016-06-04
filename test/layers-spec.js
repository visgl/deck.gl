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
import test from 'tape-catch';

/* eslint-disable func-style */
/* eslint-disable no-console */

import {Mat4} from 'luma.gl';

import {
  // DeckGLOverlay,
  // HexagonLayer,
  ChoroplethLayer,
  // ScatterplotLayer,
  // ArcLayer,
  GridLayer
} from '../src';

import CHOROPLETHS from '../example/data/sf.zip.geo.json';
// const HEXAGONS_FILE = './example/data/hexagons.csv';
// const POINTS_FILE = './example/data/sf.bike.parking.csv';

const FIXTURE = {
  window: {
    innerWidth: 800,
    innerHeight: 640
  },
  mapViewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    projectionMatrix: new Mat4()
  },
  choropleths: CHOROPLETHS,
  hexagons: null,
  points: [[100, 100]],
  arcs: null,
  arcs2: null,
  arcStrokeWidth: 1
};

// function reducer(state = INITIAL_STATE, action) {
//   switch (action.type) {
//   case 'UPDATE_MAP':
//     return {...state, mapViewState: action.mapViewState};
//   case 'LOAD_CHOROPLETHS':
//     return {...state, choropleths: action.choropleths};
//   case 'LOAD_HEXAGONS':
//     const {hexagons} = action;
//     const hexData = processHexagons(hexagons);
//     return {...state, hexagons, hexData};
//   case 'LOAD_POINTS': {
//     const points = action.points.map(point => {
//       const coordString = point.COORDINATES;
//       const p0 = coordString.indexOf('(') + 1;
//       const p1 = coordString.indexOf(')');
//       const coords = coordString.slice(p0, p1).split(',');
//       return {
//         position: {
//           x: Number(coords[1]),
//           y: Number(coords[0]),
//           z: 0
//         },
//         color: [88, 9, 124]
//       };
//     });

//     const arcs = pointsToArcs(points);
//     const arcs1 = arcs.slice(0, arcs.length / 2);
//     const arcs2 = arcs.slice(arcs.length / 2);
//     return {...state, points, arcs: arcs1, arcs2};
//   }

//   default:
//     return state;
//   }
// }

// ---- Helpers ---- //
// function processHexagons(hexagons) {
//   const values = hexagons.map(hexagon => Number(hexagon.value));
//   const maxValue = Math.max(...values);

//   const data = hexagons.map(hexagon => ({
//     centroid: {
//       x: Number(hexagon['centroid.x']),
//       y: Number(hexagon['centroid.y'])
//     },
//     vertices: [
//       [Number(hexagon['v0.x']), Number(hexagon['v0.y'])],
//       [Number(hexagon['v1.x']), Number(hexagon['v1.y'])],
//       [Number(hexagon['v2.x']), Number(hexagon['v2.y'])],
//       [Number(hexagon['v3.x']), Number(hexagon['v3.y'])],
//       [Number(hexagon['v4.x']), Number(hexagon['v4.y'])],
//       [Number(hexagon['v5.x']), Number(hexagon['v5.y'])]
//     ],
//     color: [
//       Number(hexagon.value) / maxValue * 255,
//       Number(hexagon.value) / maxValue * 128,
//       Number(hexagon.value) / maxValue * 64
//     ],
//     elevation: Number(hexagon.value) / maxValue * 100

//   }));
//   return data;
// }

// function pointsToArcs(points) {
//   return points.map((point, i) => {
//     if (i === points.length - 1) {
//       return {
//         position: {x0: 0, y0: 0, x1: 0, y1: 0},
//         color: [35, 81, 128]
//       };
//     }

//     const source = point;
//     const target = points[i + 1];

//     return {
//       position: {
//         x0: source.position.x, y0: source.position.y,
//         x1: target.position.x, y1: target.position.y
//       },
//       colors: {
//         c0: [255, 0, 0], c1: [0, 0, 255]
//       }
//     };
//   });
// }

test('GridLayer#constructor', t => {
  const {window, mapViewState, points} = FIXTURE;

  const layer = new GridLayer({
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

  t.ok(layer, 'GridLayer created');
  t.end();
});

test('ChoroplethLayer#constructor', t => {
  const {window, mapViewState, choropleths} = FIXTURE;
  const layer = new ChoroplethLayer({
    id: 'choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: choropleths,
    opacity: 0.8,
    isPickable: false,
    drawContour: true
  });

  t.ok(layer, 'ChoroplethLayer created');
  t.end();
});

  // _renderHexagonLayer() {
  //   const {mapViewState, hexData} = this.props;

  //   return new HexagonLayer({
  //     id: 'hexagonLayer',
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //     latitude: mapViewState.latitude,
  //     longitude: mapViewState.longitude,
  //     zoom: mapViewState.zoom,
  //     data: hexData,
  //     opacity: 0.5,
  //     elevation: 10,
  //     isPickable: true,
  //     onHover: this._handleHexagonHovered,
  //     onClick: this._handleHexagonClicked
  //   });
  // }

  // _renderHexagonSelectionLayer() {
  //   const {mapViewState} = this.props;
  //   const {selectedHexagons} = this.state;

  //   return new HexagonLayer({
  //     id: 'hexagonSelectionLayer',
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //     latitude: mapViewState.latitude,
  //     longitude: mapViewState.longitude,
  //     zoom: mapViewState.zoom,
  //     data: selectedHexagons,
  //     opacity: 0.1,
  //     elevation: 10,
  //     isPickable: true,
  //     onHover: this._handleHexagonHovered,
  //     onClick: this._handleHexagonClicked
  //   });
  // }

  // _renderScatterplotLayer() {
  //   const {mapViewState, points} = this.props;

  //   return new ScatterplotLayer({
  //     id: 'scatterplotLayer',
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //     latitude: mapViewState.latitude,
  //     longitude: mapViewState.longitude,
  //     zoom: mapViewState.zoom,
  //     data: points,
  //     isPickable: true,
  //     onHover: this._handleScatterplotHovered,
  //     onClick: this._handleScatterplotClicked
  //   });
  // }

  // _renderArcLayer() {
  //   const {mapViewState, arcs} = this.props;

  //   return new ArcLayer({
  //     id: 'arcLayer',
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //     latitude: mapViewState.latitude,
  //     longitude: mapViewState.longitude,
  //     zoom: mapViewState.zoom,
  //     data: arcs,
  //     strokeWidth: this.state.arcStrokeWidth || 1,
  //     color0: [0, 0, 255],
  //     color1: [0, 0, 255],
  //     isPickable: true,
  //     onHover: this._handleArcHovered,
  //     onClick: this._handleArcClicked
  //   });
  // }

