/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {experimental} from 'deck.gl';
import {csv as requestCsv} from 'd3-request';

const {AnimationMapController} = experimental;

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';  // eslint-disable-line

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
      data: null,
      animaitonDuration: 0,
      viewportToggled: false,
      onAnimationStop: this.rotateCameara.bind(this)
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

    // TODO: this is to just simulate viwport prop change and test animation.
    // this._interval = setInterval(() => this._toggleViewport(), 8000);
    this.rotateCameara({t: 1.0});
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
      animaitonDuration: 0
    });
  }

  // TODO: this is to just simulate viwport prop change and test animation.
  // Add proper UI to change viewport.
  _toggleViewport() {
    const newViewport = {};
    // newViewport.pitch = this.state.viewportToggled ? 60.0 : 0.0;
    // newViewport.bearing = this.state.viewportToggled ? -90.0 : 0.0;
    newViewport.bearing = (this.state.viewport.bearing + 120) % 360;
    this.setState({
      viewport: {...this.state.viewport, ...newViewport},
      animaitonDuration: 4000,
      viewportToggled: !this.state.viewportToggled
    });
  }

  rotateCameara(opts) {
    if (opts && opts.t < 1.0) {
      return;
    }
    const angleDelta = 120.0;
    const bearing = (this.state.viewport.bearing + angleDelta);
    const animaitonDuration = angleDelta * 35;
    this.setState({
      viewport: {
        ...this.state.viewport,
        bearing,
        width: window.innerWidth,
        height: window.innerHeight
      },
      animaitonDuration
    });
  }

  render() {
    const {
      viewport,
      data,
      animaitonDuration,
      onAnimationInterruption,
      onAnimationStop
    } = this.state;
    return (
      <AnimationMapController
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        animaitonDuration={animaitonDuration}
        onAnimationInterruption={onAnimationInterruption}
        onAnimationStop={onAnimationStop}>
        <StaticMap
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay
            viewport={viewport}
            data={data || []}
          />
        </StaticMap>
      </AnimationMapController>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
