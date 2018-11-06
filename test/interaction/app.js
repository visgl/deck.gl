import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, ScatterplotLayer, OrbitView} from 'deck.gl';
import BezierGraphLayer from './bezier-layer/bezier-graph-layer';
import {OrthographicView} from '@deck.gl/core';
import SAMPLE_GRAPH from './bezier-layer/sample-graph.json';
import loadPLY from './point-cloud-layer/ply-loader';

let index = 0;

export function nextTestCase() {
  return ++index;
}

const INITIAL_VIEW_STATE = {
  POINTCLOUD: {
    lookAt: [0, 0, 0],
    distance: OrbitView.getDistance({boundingBox: [1, 1, 1], fov: 30}),
    rotationX: 0,
    rotationOrbit: 0,
    orbitAxis: 'Y',
    fov: 30,
    minDistance: 1.5,
    maxDistance: 10,
    zoom: 0.5
  },
  BEZIER: {
    offset: [0, 0],
    zoom: 1
  },
  SCATTERPLOT: {
    longitude: -74,
    latitude: 40.7,
    zoom: 11,
    maxZoom: 16,
    pitch: 45,
    bearing: 0
  }
};

//
const MALE_COLOR = [0, 128, 255];
const FEMALE_COLOR = [255, 0, 128];

// Source data CSV for scatterplot
const DATA_URL_SCATTERPLOT =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const TEST_CASES = [
  {
    name: 'pointcloud',
    views: new OrbitView(),
    initialViewState: INITIAL_VIEW_STATE.POINTCLOUD,
    controller: true
  },
  {
    name: 'bezier',
    width: '100%',
    height: '100%',
    initialViewState: INITIAL_VIEW_STATE.BEZIER,
    views: [new OrthographicView({controller: true})],
    layers: [new BezierGraphLayer({data: SAMPLE_GRAPH})]
  },
  {
    name: 'scatterplot',
    layers: [
      new ScatterplotLayer({
        id: 'scatter-plot',
        data: DATA_URL_SCATTERPLOT,
        radiusScale: 30,
        radiusMinPixels: 0.25,
        getPosition: d => [d[0], d[1], 0],
        getColor: d => (d[2] === 1 ? MALE_COLOR : FEMALE_COLOR),
        getRadius: 1,
        updateTriggers: {
          getColor: [MALE_COLOR, FEMALE_COLOR]
        }
      })
    ],
    initialViewState: INITIAL_VIEW_STATE.SCATTERPLOT,
    controller: true
  }
];

const DATA_URL_POINTCLOUD =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/point-cloud-ply/lucy100k.ply'; // eslint-disable-line

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE.POINTCLOUD,
      points: []
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._loadData();
  }

  _loadData() {
    loadPLY(DATA_URL_POINTCLOUD).then(({vertex}) => {
      const points = [];
      vertex.x.forEach((_, i) => {
        points.push({
          color: [(0.5 - vertex.x[i]) * 255, (vertex.y[i] + 0.5) * 255, 255, 255],
          normal: [vertex.nx[i], vertex.ny[i], vertex.nz[i]],
          position: [vertex.x[i], vertex.y[i], vertex.z[i]]
        });
      });
      this.setState({points});
    });
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _renderLayers() {
    const points = this.state.points;
    return [
      new PointCloudLayer({
        id: 'point-cloud-layer',
        data: points,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getNormal: d => d.normal,
        radiusPixels: 1
      })
    ];
  }
  render() {
    const options = {onViewStateChange: this._onViewStateChange};
    options.viewState = this.state.viewState;
    if (index === 0) {
      this.name = TEST_CASES[index].name;
      options.layers = this._renderLayers();
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
