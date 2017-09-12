/* global window */
import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import {experimental} from 'deck.gl';
import TWEEN from 'tween.js';

import ControlPanel from './control-panel';

const {AnimationMapController, viewportFlyToAnimation} = experimental;
const token = process.env.MapboxAccessToken; // eslint-disable-line
const ENABLE_ZOOM_CHANGE = false;
const RANDOMIZE_ZOOM = false;

if (!token) {
  throw new Error('Please specify a valid mapbox token');
}

// Required by tween.js
function animate() {
  TWEEN.update();
  window.requestAnimationFrame(animate);
}
animate();

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.7751,
        longitude: -122.4193,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500
      },
      zoomDelta: ENABLE_ZOOM_CHANGE ? -1.0 : 0.0
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  }

  _easeTo({longitude, latitude}) {
    // Remove existing animations
    TWEEN.removeAll();

    const {viewport} = this.state;

    let zoom = viewport.zoom + this.state.zoomDelta;
    zoom = RANDOMIZE_ZOOM ? Math.floor((Math.random() * 15)) : zoom;
    const newViewport = Object.assign({}, viewport, {longitude, latitude, zoom});
    this._onViewportChange(newViewport);
  }

  _onViewportChange(viewport) {
    this.setState({viewport, zoomDelta: this.state.zoomDelta * -1.0});
  }

  render() {

    const {viewport, settings} = this.state;

    return (
      <AnimationMapController
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        animateViewport={true}
        viewportAnimationFunc={viewportFlyToAnimation}
        viewportAnimationDuration={5000}>
        <StaticMap
          {...viewport}
          {...settings}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange}
          dragToRotate={false}
          mapboxApiAccessToken={token} />
        <ControlPanel containerComponent={this.props.containerComponent}
          onViewportChange={this._easeTo.bind(this)} />
      </AnimationMapController>
    );
  }

}
