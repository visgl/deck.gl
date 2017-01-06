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
import React, {PropTypes, Component} from 'react';
import autobind from 'autobind-decorator';
import pureRender from 'pure-render-decorator';
import EventManager from './event-manager';

import config from './config';
import {mod} from './utils/transform';
import assert from 'assert';

import ViewportMercatorProject from 'viewport-mercator-project';
// import {WebMercatorViewport} from 'viewport-mercator-project';

// MAPBOX LIMITS
const MAX_PITCH = 60;
const MAX_ZOOM = 40;

// EVENT HANDLING PARAMETERS
const PITCH_MOUSE_THRESHOLD = 20;
const PITCH_ACCEL = 1.2;

@pureRender
export default class MapControls extends Component {

  static propTypes = {
    /** The width of the map */
    width: PropTypes.number.isRequired,
    /** The height of the map */
    height: PropTypes.number.isRequired,
    /** The latitude of the center of the map. */
    latitude: PropTypes.number.isRequired,
    /** The longitude of the center of the map. */
    longitude: PropTypes.number.isRequired,
    /** The tile zoom level of the map. */
    zoom: PropTypes.number.isRequired,
    /** Specify the bearing of the viewport */
    bearing: React.PropTypes.number,
    /** Specify the pitch of the viewport */
    pitch: React.PropTypes.number,
    /**
      * Specify the altitude of the viewport camera
      * Unit: map heights, default 1.5
      * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
      */
    altitude: React.PropTypes.number,

    /** Enables perspective control event handling */
    perspectiveEnabled: PropTypes.bool,
    /**
      * `onChangeViewport` callback is fired when the user interacted with the
      * map. The object passed to the callback contains `latitude`,
      * `longitude` and `zoom` and additional state information.
      */
    onChangeViewport: PropTypes.func,

    /**
      * Is the component currently being dragged. This is used to show/hide the
      * drag cursor. Also used as an optimization in some overlays by preventing
      * rendering while dragging.
      */
    isDragging: PropTypes.bool,
    /**
      * Required to calculate the mouse projection after the first click event
      * during dragging. Where the map is depends on where you first clicked on
      * the map.
      */
    startDragLngLat: PropTypes.arrayOf(PropTypes.number),
    /** Bearing when current perspective drag operation started */
    startBearing: PropTypes.number,
    /** Pitch when current perspective drag operation started */
    startPitch: PropTypes.number,

    /* Hooks to get mapbox help with calculations. TODO - replace with Viewport */
    unproject: PropTypes.func.isRequired,
    getLngLatAtPoint: PropTypes.func.isRequired
  };

  static defaultProps = {
    bearing: 0,
    pitch: 0,
    altitude: 1.5,
    clickRadius: 15,
    onChangeViewport: null,
    maxZoom: MAX_ZOOM,
    minZoom: 0,
    maxPitch: MAX_PITCH,
    minPitch: 0
  };

  /**
   * @classdesc
   * A component that handles events and updates viewport parameters
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

  // New props are comin' round the corner!
  componentWillReceiveProps(newProps) {
    const {startDragLngLat} = newProps;
    this.setState({
      startDragLngLat: startDragLngLat && startDragLngLat.slice()
    });
  }

  // Calculate a cursor style to show that we are in "dragging state"
  _getCursor() {
    const isInteractive =
      this.props.onChangeViewport ||
      this.props.onClickFeature ||
      this.props.onHoverFeatures;
    if (isInteractive) {
      return this.props.isDragging ?
        config.CURSOR.GRABBING :
        (this.state.isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB);
    }
    return 'inherit';
  }

  _updateViewport(opts) {
    let viewport = {
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      zoom: this.props.zoom,
      bearing: this.props.bearing,
      pitch: this.props.pitch,
      altitude: this.props.altitude,
      isDragging: this.props.isDragging,
      startDragLngLat: this.props.startDragLngLat,
      startBearing: this.props.startBearing,
      startPitch: this.props.startPitch,
      ...opts
    };

    viewport = this._applyConstraints(viewport);

    if (viewport.startDragLngLat) {
      const dragViewport = ViewportMercatorProject({
        ...this.props,
        longitude: viewport.startDragLngLat[0],
        latitude: viewport.startDragLngLat[1]
      });
      this.setState({dragViewport});
    }

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

  // Calculate a new lnglat based on pixel dragging position
  // TODO - We should have a mapbox-independent implementation of panning
  // Panning calculation is currently done using an undocumented mapbox function
  _calculateNewLngLat({startDragLngLat, pos, startPos}) {
    return this.props.getLngLatAtPoint({lngLat: startDragLngLat, pos});
    // return this.state.dragViewport.unproject(pos);
  }

  // Calculates new zoom
  _calculateNewZoom({relativeScale}) {
    return this.props.zoom + Math.log2(relativeScale);
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({pos, startPos, startBearing, startPitch}) {
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
      if (startPos.y > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        const yScale = 1 - pos[1] / startPos[1];
        // Gradually add until we hit max pitch
        pitch = startPitch + yScale * (MAX_PITCH - startPitch);
      }
    }

    // console.debug(startPitch, pitch);
    return {
      pitch: Math.max(Math.min(pitch, MAX_PITCH), 0),
      bearing
    };
  }

  @autobind _onTouchStart(opts) {
    this._onMouseDown(opts);
  }

  @autobind _onTouchDrag(opts) {
    this._onMouseDrag(opts);
  }

  @autobind _onTouchRotate(opts) {
    this._onMouseRotate(opts);
  }

  @autobind _onTouchEnd(opts) {
    this._onMouseUp(opts);
  }

  @autobind _onTouchTap(opts) {
    this._onMouseClick(opts);
  }

  @autobind _onMouseDown({pos}) {
    this._updateViewport({
      isDragging: true,
      startDragLngLat: this.props.unproject(pos),
      startBearing: this.props.bearing,
      startPitch: this.props.pitch
    });
  }

  @autobind _onMouseDrag({pos}) {
    if (!this.props.onChangeViewport) {
      return;
    }

    const {startDragLngLat} = this.state;

    // take the start lnglat and put it where the mouse is down.
    assert(startDragLngLat, '`startDragLngLat` prop is required ' +
      'for mouse drag behavior to calculate where to position the map.');

    const [longitude, latitude] = this._calculateNewLngLat({
      startDragLngLat,
      pos
    });

    this._updateViewport({
      longitude,
      latitude,
      isDragging: true
    });
  }

  @autobind _onMouseRotate({pos, startPos}) {
    if (!this.props.onChangeViewport || !this.props.perspectiveEnabled) {
      return;
    }

    const {startBearing, startPitch} = this.props;
    assert(typeof startBearing === 'number',
      '`startBearing` prop is required for mouse rotate behavior');
    assert(typeof startPitch === 'number',
      '`startPitch` prop is required for mouse rotate behavior');

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

  @autobind _onMouseUp(opt) {
    this._updateViewport({
      isDragging: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    });
  }

  @autobind _onZoom({pos, scale}) {
    this._updateViewport({
      zoom: this._calculateNewZoom({relativeScale: scale}),
      isDragging: true
    });
  }

  @autobind _onZoomEnd() {
    this._updateViewport({isDragging: false});
  }

  // Note that mouse move and click are handled directly by static-map
  // onMouseMove={this._onMouseMove}
  // onMouseClick={this._onMouseClick}

  render() {
    const {className, width, height, style} = this.props;
    const mapEventLayerStyle = {
      ...style,
      width,
      height,
      position: 'relative',
      cursor: this._getCursor()
    };

    return (
      <div className={className} style={mapEventLayerStyle}>

        <EventManager
          width={this.props.width}
          height={this.props.height}
          onMouseDown={this._onMouseDown}
          onMouseDrag={this._onMouseDrag}
          onMouseRotate={this._onMouseRotate}
          onMouseUp={this._onMouseUp}
          onTouchStart={this._onTouchStart}
          onTouchDrag={this._onTouchDrag}
          onTouchRotate={this._onTouchRotate}
          onTouchEnd={this._onTouchEnd}
          onTouchTap={this._onTouchTap}
          onZoom={this._onZoom}
          onZoomEnd={this._onZoomEnd}>

          {this.props.children}

        </EventManager>

      </div>
    );
  }
}
