/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {LinearInterpolator, experimental} from 'deck.gl';
import {csv as requestCsv} from 'd3-request';

const {MapControllerJS} = experimental;
// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';  // eslint-disable-line

const transitionInterpolator = new LinearInterpolator(['bearing']);

class Root extends Component {

  constructor(props) {
    super(props);
    this.rotationStep = 0;
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500,
        bearing: 0
      },
      transitions: {
        transitionDuration: 0,
        transitionInterpolator,
        onViewportChange: this._onViewportChange.bind(this),
        onTransitionEnd: this._rotateCamera.bind(this)
      },
      data: null,
      viewportToggled: false
    };

    requestCsv(DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => ([Number(d.lng), Number(d.lat)]));
        this.setState({data});
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._rotateCamera();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport},
      transitions: {
        ...this.state.transitions,
        transitionDuration: 0
      }
    });
  }

  _rotateCamera() {
    const angleDelta = 120.0;
    const bearing = (this.state.viewport.bearing + angleDelta);
    const transitionDuration = angleDelta * 35;
    this.setState({
      viewport: {
        ...this.state.viewport,
        bearing,
        width: window.innerWidth,
        height: window.innerHeight
      },
      transitions: {
        ...this.state.transitions,
        transitionDuration
      }
    });
  }

  render() {
    const {
      viewport,
      data,
      transitions
    } = this.state;
    return (
      <StaticMap
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay
          viewport={viewport}
          transitions={transitions}
          data={data || []}
          ControllerType = {MapControllerJS}
        />
      </StaticMap>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
