import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {OrbitView} from '@deck.gl/core';
import PlotLayer from './plot-layer';
import {scaleLinear} from 'd3-scale';

const EQUATION = (x, y) => (Math.sin(x * x + y * y) * x) / Math.PI;

const INITIAL_VIEW_STATE = {
  target: [0.5, 0.5, 0.5],
  orbitAxis: 'Y',
  rotationX: 30,
  rotationOrbit: -30,
  /* global window */
  zoom: Math.log2(window.innerHeight / 3) // fit 3x3x3 box in current viewport
};

function getScale({min, max}) {
  return scaleLinear()
    .domain([min, max])
    .range([0, 1]);
}

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverInfo: null
    };

    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover(info) {
    const hoverInfo = info.sample ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  _renderTooltip() {
    const {hoverInfo} = this.state;
    return (
      hoverInfo && (
        <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
          {hoverInfo.sample.map(x => x.toFixed(3)).join(', ')}
        </div>
      )
    );
  }

  render() {
    const {resolution = 200, showAxis = true, equation = EQUATION} = this.props;

    const layers = [
      equation &&
        resolution &&
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
          pickable: true,
          onHover: this._onHover,
          updateTriggers: {
            getPosition: equation
          }
        })
    ];

    return (
      <DeckGL
        layers={layers}
        views={new OrbitView()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
