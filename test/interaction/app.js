import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, OrbitView} from 'deck.gl';
import BezierGraphLayer from './bezier-graph-layer';
import {OrthographicView} from '@deck.gl/core';
import SAMPLE_GRAPH from './sample-graph.json';
import PlotLayer from './plot-layer';
import {scaleLinear} from 'd3-scale';

let index = 0;

export function nextTestCase() {
  return ++index;
}

const INITIAL_VIEW_STATE = {
  BEZIER: {
    offset: [0, 0],
    zoom: 1
  },
  PLOT: {
    lookAt: [0, 0, 0],
    distance: OrbitView.getDistance({boundingBox: [3, 3, 3], fov: 50}),
    rotationX: -30,
    rotationOrbit: 30,
    orbitAxis: 'Y',
    fov: 50,
    minDistance: 1,
    maxDistance: 20
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
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const EQUATION = (x, y) => (Math.sin(x * x + y * y) * x) / Math.PI;

function getScale({min, max}) {
  return scaleLinear()
    .domain([min, max])
    .range([0, 1]);
}

const TEST_CASES = [
  {
    name: 'plot',
    layers: [
      EQUATION &&
        200 &&
        new PlotLayer({
          getPosition: (u, v) => {
            const x = (u - 1 / 2) * Math.PI * 2;
            const y = (v - 1 / 2) * Math.PI * 2;
            return [x, y, EQUATION(x, y)];
          },
          getColor: (x, y, z) => [40, z * 128 + 128, 160],
          getXScale: getScale,
          getYScale: getScale,
          getZScale: getScale,
          uCount: 200,
          vCount: 200,
          drawAxes: true,
          axesPadding: 0.25,
          axesColor: [0, 0, 0, 128],
          opacity: 1,
          updateTriggers: {
            getPosition: EQUATION
          }
        })
    ],
    views: new OrbitView(),
    initialViewState: INITIAL_VIEW_STATE.PLOT,
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
        data: DATA_URL,
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

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredObject: null
    };
    this._onHover = this._onHover.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const options = {onViewStateChange: this._onViewStateChange};
    if (index === 0) {
      this.initialViewState = TEST_CASES[index].initialViewState;
    } else {
      options.viewState = this.state.viewState;
      if (this.initialViewState !== TEST_CASES[index].initialViewState) {
        this.initialViewState = TEST_CASES[index].initialViewState;
        options.viewState = TEST_CASES[index].initialViewState;
      }
    }
    const props = Object.assign({}, TEST_CASES[index], options);
    return <DeckGL {...props} />;
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
