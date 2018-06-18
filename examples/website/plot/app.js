/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {OrbitView} from 'deck.gl';
import {_OrbitController as OrbitController} from 'deck.gl';
import PlotLayer from './plot-layer';
import {scaleLinear} from 'd3-scale';

const EQUATION = (x, y) => Math.sin(x * x + y * y) * x / Math.PI;

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };

    this._onResize = this._onResize.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
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

  render() {
    const {width = '100%', height = '100%', resolution, showAxis, equation} = this.props;
    const {viewState} = this.state;

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
        layers={layers}
        width={width}
        height={height}
        views={new OrbitView()}
        viewState={viewState}
        controller={OrbitController}
        onViewStateChange={this._onViewStateChange}
      />
    );
  }
}

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._onHover = this._onHover.bind(this);
  }

  _onHover(info) {
    const hoverInfo = info.sample ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  render() {
    const {hoverInfo} = this.state;

    return (
      <div>
        <App equation={EQUATION} resolution={200} showAxis={true} onHover={this.props.onHover} />

        {hoverInfo && (
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
            {hoverInfo.sample.map(x => x.toFixed(3)).join(', ')}
          </div>
        )}
      </div>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App};
// App.INITIAL_VIEW_STATE = INITIAL_VIEW_STATE;

if (!window.demoLauncherActive) {
  render(<Root />, document.body.appendChild(document.createElement('div')));
}
