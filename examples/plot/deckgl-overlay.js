import React, {Component} from 'react';

import PlotLayer from './plot-layer';
import DeckGL, {OrbitView, experimental} from 'deck.gl';
const {OrbitController} = experimental;
import {scaleLinear} from 'd3-scale';

const INITIAL_VIEW_STATE = {
  lookAt: [0, 0, 0],
  distance: 3,
  rotationX: -30,
  rotationOrbit: 30,
  orbitAxis: 'Y',
  fov: 50,
  minDistance: 1,
  maxDistance: 20,
  width: 500,
  height: 500
};

function getScale({min, max}) {
  return scaleLinear()
    .domain([min, max])
    .range([0, 1]);
}

export default class DeckGLOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE,
      width: 0,
      height: 0
    };

    this._onResize = this._onResize.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  _onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const {fov} = this.state.viewState;
    const newViewState = Object.assign({}, this.viewState, {
      distance: OrbitView.getDistance({boundingBox: [3, 3, 3], fov})
    });
    this._onViewportChange(newViewState, {});
  }

  _onViewportChange(viewState) {
    Object.assign(this.state.viewState, viewState);
    this.setState({viewState: this.state.viewState});
  }

  render() {
    const {resolution, showAxis, equation} = this.props;
    const {width, height, viewState} = this.state;

    const layers = [
      equation &&
        new PlotLayer({
          getPosition: (u, v) => {
            const x = (u - 1 / 2) * Math.PI * 2;
            const y = (v - 1 / 2) * Math.PI * 2;
            return [x, y, equation(x, y)];
          },
          getColor: (x, y, z) => [40, z * 128 + 128, 160],
          getXScale: getScale,
          getYScale: getScale,
          getZScale: getScale,
          uCount: resolution,
          vCount: resolution,
          drawAxes: showAxis,
          axesPadding: 0.25,
          axesColor: [0, 0, 0, 128],
          opacity: 1,
          pickable: Boolean(this.props.onHover),
          onHover: this.props.onHover,
          updateTriggers: {
            getPosition: equation
          }
        })
    ];

    return (
      <DeckGL
        width={width}
        height={height}
        layers={layers}
        views={new OrbitView()}
        viewState={viewState}
        controller={OrbitController}
        onViewportChange={this._onViewportChange}
      />
    );
  }
}
