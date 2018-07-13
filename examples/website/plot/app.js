/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {OrbitView} from 'deck.gl';
import PlotLayer from './plot-layer';
import {scaleLinear} from 'd3-scale';

const EQUATION = (x, y) => (Math.sin(x * x + y * y) * x) / Math.PI;

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

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE,
      hoverInfo: null
    };

    this._onResize = this._onResize.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    const {fov} = this.state.viewState;
    const viewState = Object.assign({}, this.viewState, {
      distance: OrbitView.getDistance({boundingBox: [3, 3, 3], fov})
    });
    this._onViewStateChange({viewState});
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
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
    const {viewState} = this.state;

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
        viewState={viewState}
        controller={true}
        onViewStateChange={this._onViewStateChange}
      >
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
