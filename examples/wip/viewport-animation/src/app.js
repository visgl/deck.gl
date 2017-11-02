/* global window */
import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import {
  viewportFlyToInterpolator,
  TRANSITION_EVENTS,
  ViewportController,
  MapState
} from 'deck.gl';

import ControlPanel from './control-panel';

const token = process.env.MapboxAccessToken; // eslint-disable-line
const interruptionStyles = [
  {
    title: 'BREAK',
    style: TRANSITION_EVENTS.BREAK
  },
  {
    title: 'SNAP_TO_END',
    style: TRANSITION_EVENTS.SNAP_TO_END
  },
  {
    title: 'IGNORE',
    style: TRANSITION_EVENTS.IGNORE
  }
];

if (!token) {
  throw new Error('Please specify a valid mapbox token');
}

// Required by tween.js
function animate() {
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
      transitionDuration: 0
    };
    this._interruptionStyle = TRANSITION_EVENTS.BREAK;
    this._resize = this._resize.bind(this);
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
        height: this.props.height || window.innerHeight,
        transitionDuration: 0
      }
    });
  }

  _easeTo({longitude, latitude}) {

    this.setState({
      viewport: {...this.state.viewport, longitude, latitude, zoom: 11},
      transitionDuration: 8000,
      viewportToggled: !this.state.viewportToggled
    });
  }

  _onStyleChange(style) {
    this._interruptionStyle = style;
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport},
      transitionDuration: 0
    });
  }

  render() {

    const {viewport, settings, transitionDuration} = this.state;

    return (
      <ViewportController
        viewportState={MapState}
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        transitionInterpolator={viewportFlyToInterpolator}
        transitionDuration={transitionDuration}
        transitionProps={['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'width', 'height']}
        transitionInterruption={this._interruptionStyle}>
        <StaticMap
          {...viewport}
          {...settings}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange}
          dragToRotate={false}
          mapboxApiAccessToken={token} />
        <ControlPanel containerComponent={this.props.containerComponent}
          onViewportChange={this._easeTo.bind(this)}
          interruptionStyles={interruptionStyles}
          onStyleChange={this._onStyleChange.bind(this)} />
      </ViewportController>
    );
  }

}
