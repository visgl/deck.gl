// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';
import {PerspectiveMercatorViewport} from 'viewport-mercator-project';

// MapControls uses non-react event manager to register events
import EventManager from './event-manager';

// import browser from 'bowser';
const PREFIX = '-webkit-';
// browser.webkit || browser.blink ? '-webkit-' :
// browser.gecko ? '-moz-' :
// '';
const CURSOR = {
  GRABBING: `${PREFIX}grabbing`,
  GRAB: `${PREFIX}grab`,
  POINTER: 'pointer'
};

function mod(value, divisor) {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}
// MAPBOX LIMITS
const MAX_PITCH = 60;
const MAX_ZOOM = 40;

// EVENT HANDLING PARAMETERS
const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;

/* eslint-disable no-inline-comments */
const propTypes = {
  width: PropTypes.number.isRequired, // The width of the map
  height: PropTypes.number.isRequired, // The height of the map
  latitude: PropTypes.number.isRequired, // The latitude of the center of the map.
  longitude: PropTypes.number.isRequired,  // The longitude of the center of the map.
  zoom: PropTypes.number.isRequired, // The tile zoom level of the map.
  bearing: PropTypes.number, // Specify the bearing of the viewport
  pitch: PropTypes.number, // Specify the pitch of the viewport
  altitude: PropTypes.number, // Altitude of viewport camera. Unit: map heights, default 1.5

  constraints: PropTypes.object,

  perspectiveEnabled: PropTypes.bool,  // Enables perspective control event handling

  onChangeViewport: PropTypes.func, // `onChangeViewport` is fired on user interaction

  isDragging: PropTypes.bool, // Is the component currently being dragged.
  startDragLngLat: PropTypes.arrayOf(PropTypes.number), // Position when current drag started
  startBearing: PropTypes.number, // Bearing when current perspective drag started
  startPitch: PropTypes.number, // Pitch when current perspective drag operation started

  pressKeyToRotate: PropTypes.bool, // If key must be pressed for mouse to rotate vs pan

  /* Hooks to get mapbox help with calculations. TODO - replace with Viewport */
  unproject: PropTypes.func,
  getLngLatAtPoint: PropTypes.func
};

const defaultProps = {
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  clickRadius: 15,
  onChangeViewport: null,

  maxZoom: MAX_ZOOM,
  minZoom: 0,
  maxPitch: MAX_PITCH,
  minPitch: 0,

  unproject: null,
  getLngLatAtPoint: null,

  pressKeyToRotate: true
};

export default class MapControls extends PureComponent {
  /**
   * @classdesc
   * A component that monitors events and updates mercator style viewport parameters
   * It can be used with or without a mapbox map
   * (e.g. it could pan over a static map image)
   */
  constructor(props) {
    super(props);
    this.state = {
      isDragging: false,
      isHovering: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    };
  }

  componentDidMount() {
    // Register event handlers on the canvas using the EventManager helper class
    //
    // Note that mouse move and click are handled directly by static-map
    // Corresponding to hover and click on map
    // onMouseMove={this._onMouseMove}
    // onMouseClick={this._onMouseClick}

    this._eventManager = new EventManager(this.refs.canvas, {
      onMouseDown: this._onMouseDown.bind(this),
      onMouseDrag: this._onMouseDrag.bind(this),
      onMouseRotate: this._onMouseRotate.bind(this),
      onMouseUp: this._onMouseUp.bind(this),
      onZoom: this._onZoom.bind(this),
      onZoomEnd: this._onZoomEnd.bind(this),
      mapTouchToMouse: true,
      pressKeyToRotate: this.props.pressKeyToRotate
    });
  }

  // New props are comin' round the corner!
  componentWillReceiveProps(newProps) {
    const {startDragLngLat} = newProps;
    this.setState({
      startDragLngLat: startDragLngLat && [...startDragLngLat]
    });
  }

  // Calculate a cursor style to show that we are in "dragging state"
  _getCursor() {
    const isInteractive =
      this.props.onChangeViewport ||
      this.props.onClickFeature ||
      this.props.onHoverFeatures;

    if (!isInteractive) {
      return 'inherit';
    }
    if (this.props.isDragging) {
      return CURSOR.GRABBING;
    }
    if (this.state.isHovering) {
      return CURSOR.POINTER;
    }
    return CURSOR.GRAB;
  }

  _updateViewport(opts) {
    let viewport = Object.assign({
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      zoom: this.props.zoom,
      bearing: this.props.bearing,
      pitch: this.props.pitch,
      altitude: this.props.altitude,
      isDragging: this.props.isDragging,
      startDragLngLat: this.props.startDragLngLat,
      startBearing: this.props.startBearing,
      startPitch: this.props.startPitch
    }, opts);

    viewport = this._applyConstraints(viewport);

    return this.props.onChangeViewport(viewport);
  }

  // Apply any constraints (mathematical or defined by props) to viewport params
  _applyConstraints(viewport) {
    // Normalize degrees
    viewport.longitude = mod(viewport.longitude + 180, 360) - 180;
    viewport.bearing = mod(viewport.bearing + 180, 360) - 180;

    // Ensure zoom is within specified range
    const {maxZoom, minZoom} = this.props;
    viewport.zoom = viewport.zoom > maxZoom ? maxZoom : viewport.zoom;
    viewport.zoom = viewport.zoom < minZoom ? minZoom : viewport.zoom;

    // Ensure pitch is within specified range
    const {maxPitch, minPitch} = this.props;

    viewport.pitch = viewport.pitch > maxPitch ? maxPitch : viewport.pitch;
    viewport.pitch = viewport.pitch < minPitch ? minPitch : viewport.pitch;

    return viewport;
  }

  _unproject(pos) {
    const viewport = new PerspectiveMercatorViewport(Object.assign({}, this.props));
    const lngLat = this.props.unproject ?
      this.props.unproject(pos) :
      viewport.unproject(pos, {topLeft: false});
    return lngLat;
  }

  // Calculate a new lnglat based on pixel dragging position
  // TODO - We should have a mapbox-independent implementation of panning
  // Panning calculation is currently done using an undocumented mapbox function
  _calculateNewLngLat({startDragLngLat, pos, startPos}) {
    const viewport = new PerspectiveMercatorViewport(Object.assign({}, this.props, {
      longitude: startDragLngLat[0],
      latitude: startDragLngLat[1]
    }));

    const lngLat = this.props.getLngLatAtPoint ?
      this.props.getLngLatAtPoint({lngLat: startDragLngLat, pos}) :
      viewport.getLocationAtPoint({lngLat: startDragLngLat, pos});

    return lngLat;
  }

  // Calculates new zoom
  _calculateNewZoom({relativeScale}) {
    return this.props.zoom + Math.log2(relativeScale);
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({pos, startPos, startBearing, startPitch}) {
    const {maxPitch} = this.props;
    // TODO minPitch

    const xDelta = pos[0] - startPos[0];
    const yDelta = pos[1] - startPos[1];

    const bearing = startBearing + 180 * xDelta / this.props.width;

    let pitch = startPitch;
    if (yDelta > 0) {
      // Dragging downwards, gradually decrease pitch
      if (Math.abs(this.props.height - startPos[1]) > PITCH_MOUSE_THRESHOLD) {
        const scale = yDelta / (this.props.height - startPos[1]);
        pitch = (1 - scale) * PITCH_ACCEL * startPitch;
      }
    } else if (yDelta < 0) {
      // Dragging upwards, gradually increase pitch
      if (startPos[1] > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        const yScale = 1 - pos[1] / startPos[1];
        // Gradually add until we hit max pitch
        pitch = startPitch + yScale * (maxPitch - startPitch);
      }
    }

    return {
      pitch,
      bearing
    };
  }

  // EVENT HANDLERS

  _onMouseDown({pos}) {
    this._updateViewport({
      isDragging: true,
      startDragLngLat: this._unproject(pos),
      startBearing: this.props.bearing,
      startPitch: this.props.pitch
    });
  }

  _onMouseDrag({pos}) {
    if (!this.props.onChangeViewport) {
      return;
    }

    const {startDragLngLat} = this.state;

    // take the start lnglat and put it where the mouse is down.
    if (!startDragLngLat) {
      console.log( // eslint-disable-line
        startDragLngLat, '`startDragLngLat` prop is required ' +
        'for mouse drag behavior to calculate where to position the map.');
      return;
    }
    // assert(startDragLngLat, '`startDragLngLat` prop is required ' +
    //   'for mouse drag behavior to calculate where to position the map.');

    const [longitude, latitude] = this._calculateNewLngLat({startDragLngLat, pos});

    this._updateViewport({
      longitude,
      latitude,
      isDragging: true
    });
  }

  _onMouseRotate({pos, startPos}) {
    if (!this.props.onChangeViewport || !this.props.perspectiveEnabled) {
      return;
    }

    const {startBearing, startPitch} = this.props;
    if (typeof startBearing !== 'number') {
      console.error( // eslint-disable-line
        '`startBearing` prop is required for mouse rotate behavior');
      return;
    }
    if (typeof startPitch !== 'number') {
      console.error( // eslint-disable-line
        '`startPitch` prop is required for mouse rotate behavior');
      return;
    }

    // assert(typeof startBearing === 'number',
    //   '`startBearing` prop is required for mouse rotate behavior');
    // assert(typeof startPitch === 'number',
    //   '`startPitch` prop is required for mouse rotate behavior');

    const {pitch, bearing} = this._calculateNewPitchAndBearing({
      pos,
      startPos,
      startBearing,
      startPitch
    });

    this._updateViewport({
      bearing,
      pitch,
      isDragging: true
    });
  }

  _onMouseUp(opt) {
    this._updateViewport({
      isDragging: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    });
  }

  _onZoom({pos, scale}) {
    // Make sure we zoom around the current mouse position rather than map center
    const viewport = new PerspectiveMercatorViewport(this.props);
    const aroundLngLat = viewport.unproject(pos);

    const zoom = this._calculateNewZoom({relativeScale: scale});

    const zoomedViewport = new PerspectiveMercatorViewport(Object.assign({}, this.props, {zoom}));
    const [longitude, latitude] = zoomedViewport.getLocationAtPoint({lngLat: aroundLngLat, pos});

    this._updateViewport({
      zoom: this._calculateNewZoom({relativeScale: scale}),
      longitude,
      latitude,
      isDragging: true
    });
  }

  _onZoomEnd() {
    this._updateViewport({isDragging: false});
  }

  render() {
    const {className, width, height, style} = this.props;

    const mapEventLayerStyle = Object.assign({}, style, {
      width,
      height,
      position: 'relative',
      cursor: this._getCursor()
    });

    return createElement('div', {
      ref: 'canvas',
      style: mapEventLayerStyle,
      className
    }, this.props.children);
  }
}

MapControls.displayName = 'MapControls';
MapControls.propTypes = propTypes;
MapControls.defaultProps = defaultProps;
