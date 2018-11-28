/* global document, window */

import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {
  COORDINATE_SYSTEM,
  PointCloudLayer,
  PolygonLayer,
  ScatterplotLayer,
  OrbitView
} from 'deck.gl';
import {OrthographicView} from 'deck.gl';
import {default as choropleths} from '../../examples/layer-browser/data/sf.zip.geo';

let index = 0;
window.nextTestCase = function nextTestCase() {
  return ++index;
};

function getPointCloud() {
  const pointCloud = [];
  const RESOLUTION = 100;
  const R = 0.7;
  // x is longitude, from 0 to 360
  // y is latitude, from -90 to 90
  for (let yIndex = 0; yIndex <= RESOLUTION; yIndex++) {
    const y = (yIndex / RESOLUTION - 1 / 2) * Math.PI;
    const cosy = Math.cos(y);
    const siny = Math.sin(y);
    // need less samples at high latitude
    const xCount = Math.floor(cosy * RESOLUTION * 2) + 1;

    for (let xIndex = 0; xIndex < xCount; xIndex++) {
      const x = (xIndex / xCount) * Math.PI * 2;
      const cosx = Math.cos(x);
      const sinx = Math.sin(x);

      pointCloud.push({
        position: [cosx * R * cosy, sinx * R * cosy, (siny + 1) * R],
        normal: [cosx * cosy, sinx * cosy, siny],
        color: [(siny + 1) * 128, (cosy + 1) * 128, 0]
      });
    }
  }
  return pointCloud;
}

function getScatterPlot() {
  const data = [];
  const RESOLUTION = 10;
  for (let x = -RESOLUTION; x < RESOLUTION; x += 2) {
    for (let y = -RESOLUTION; y < RESOLUTION; y += 2) {
      data.push({
        radius: (Math.abs(x * y + x + y) % 4) + 1,
        position: [x * 10, y * 10]
      });
    }
  }
  return data;
}

const TEST_CASES = [
  {
    name: 'pointcloud',
    layers: [
      new PointCloudLayer({
        id: 'point-cloud-layer',
        data: getPointCloud(),
        pickable: false,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        radiusPixels: 4,
        getPosition: d => d.position,
        getNormal: d => d.normal,
        getColor: d => d.color
      })
    ],
    views: new OrbitView(),
    initialViewState: {
      lookAt: [0, 0, 0],
      eye: [0, 0, -15],
      distance: OrbitView.getDistance({boundingBox: [3, 3, 3], fov: 50}),
      rotationX: -30,
      rotationOrbit: 30,
      orbitAxis: 'Y',
      fov: 100,
      minDistance: 1,
      maxDistance: 20
    },
    controller: true
  },
  {
    name: 'Scatterplot',
    layers: [
      new ScatterplotLayer({
        id: 'nodes',
        data: getScatterPlot(),
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getRadius: d => d.radius * 3,
        getColor: [0, 0, 150, 255]
      })
    ],
    views: new OrthographicView(),
    initialViewState: {
      offset: [0, 0],
      zoom: 1
    },
    controller: true
  },
  {
    name: 'polygon',
    layers: [
      new PolygonLayer({
        id: 'polygon-layer',
        data: choropleths.features,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.geometry.coordinates,
        getElevation: 1,
        getFillColor: [1, 140, 0]
      })
    ],
    initialViewState: {
      latitude: 37.7749295,
      longitude: -122.4194155,
      zoom: 11,
      bearing: 0,
      pitch: 45
    },
    controller: true
  }
];

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: props.testCases[index].initialViewState
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const options = {onViewStateChange: this._onViewStateChange};
    options.viewState = this.state.viewState;
    if (!this.name || this.name !== this.props.testCases[index].name) {
      this.name = this.props.testCases[index].name;
      options.viewState = this.props.testCases[index].initialViewState;
    }
    const props = Object.assign({}, this.props.testCases[index], options);
    return React.createElement(DeckGL, props, null);
  }
}

render(
  React.createElement(App, {testCases: TEST_CASES}, null),
  document.body.appendChild(document.createElement('div'))
);
