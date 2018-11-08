import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {
  COORDINATE_SYSTEM,
  PointCloudLayer,
  PolygonLayer,
  ScatterplotLayer,
  OrbitView
} from 'deck.gl';
import {OrthographicView} from '@deck.gl/core';
import DATA from './data.json';

let index = 0;
export function nextTestCase() {
  return ++index;
}

function getPointCloud() {
  const pointCloud = [];
  const RESOLUTION = 100;
  const R = 1;
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

const INITIAL_VIEW_STATE = {
  POINTCLOUD: {
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
  SCATTERPLOT: {
    offset: [0, 0],
    zoom: 1
  },
  POLYGON: {
    latitude: 37.7749295,
    longitude: -122.4194155,
    zoom: 11,
    bearing: 0,
    pitch: 0
  }
};

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
    controller: true,
    initialViewState: INITIAL_VIEW_STATE.POINTCLOUD
  },
  {
    name: 'Scatterplot',
    width: '100%',
    height: '100%',
    initialViewState: INITIAL_VIEW_STATE.SCATTERPLOT,
    layers: [
      new ScatterplotLayer({
        id: 'nodes',
        data: DATA.SCATTERPLOT,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getRadius: d => d.radius * 3,
        getColor: d => [0, 0, 150, 255]
      })
    ],
    views: [new OrthographicView({controller: true})]
  },
  {
    name: 'polygon',
    layers: [
      new PolygonLayer({
        id: 'polygon-layer',
        data: DATA.POLYGON,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.contour,
        getElevation: d => d.population / d.area / 10,
        getFillColor: d => [d.population / d.area / 60, 140, 0]
      })
    ],
    initialViewState: INITIAL_VIEW_STATE.POLYGON,
    controller: true
  }
];

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: TEST_CASES[index].initialViewState
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const options = {onViewStateChange: this._onViewStateChange};
    options.viewState = this.state.viewState;
    if (index === 0) {
      this.name = TEST_CASES[index].name;
    } else if (this.name !== TEST_CASES[index].name) {
      this.name = TEST_CASES[index].name;
      options.viewState = TEST_CASES[index].initialViewState;
    }
    const props = Object.assign({}, TEST_CASES[index], options);
    return <DeckGL {...props} />;
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
