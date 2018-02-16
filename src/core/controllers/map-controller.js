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

import Controller from './controller';
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import {normalizeViewportProps} from 'viewport-mercator-project';

import {clamp} from 'math.gl';
import assert from 'assert';

// At the moment we enforce mapbox limits by default
import MAPBOX_LIMITS from './mapbox-limits';

// GENERIC MAP LIMITS
export const MAP_LIMITS = {
  // latitude which corresponds to a projected square (y = 0), typical limit for maps
  maxLatitude: 85.05113,
  minLatitude: -85.05113,
  minPitch: 0,
  maxPitch: 89,
  minZoom: 0,
  maxZoom: 40
};

// EVENT HANDLING PARAMETERS
const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;

export function mod(value, divisor) {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

// Helper functions
function normalizeDegrees(degrees) {
  return degrees < -180 || degrees > 180 ? mod(degrees + 180, 360) - 180 : degrees;
}

// EVENT REDUCERS

// Pan
// @param {[Number, Number]} pos - position on screen where the pointer is
// @param {[Number, Number], optional} startPos - where the pointer grabbed at
//   the start of the operation. Must be supplied of `panStart()` was not called
function pan(viewState, {pos, startPos, startViewState}) {
  const startViewport = new WebMercatorViewport(startViewState.props);
  const startPanLngLat = startViewport.unproject(startPos);

  // take the start lnglat and put it where the mouse is down.
  const viewport = new WebMercatorViewport(viewState.props);
  const [longitude, latitude] = viewport.getLocationAtPoint({lngLat: startPanLngLat, pos});

  return viewState.getUpdatedState({
    longitude,
    latitude
  });
}

// Rotate
// @param {Number} deltaScaleX - a number between [-1, 1] specifying the
//   change to bearing.
// @param {Number} deltaScaleY - a number between [-1, 1] specifying the
//   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
function rotate(viewState, {deltaScaleX, deltaScaleY, startViewState}) {
  assert(deltaScaleX >= -1 && deltaScaleX <= 1, 'deltaScaleX must be a number in [-1, 1]');
  assert(deltaScaleY >= -1 && deltaScaleY <= 1, 'deltaScaleY must be a number in [-1, 1]');

  const startBearing = startViewState.props.bearing;
  const startPitch = startViewState.props.pitch;
  const minPitch = 0;
  const maxPitch = 60;

  const bearing = startBearing + 180 * deltaScaleX;
  let pitch = startPitch;
  if (deltaScaleY > 0) {
    // Gradually increase pitch
    pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
  } else if (deltaScaleY < 0) {
    // Gradually decrease pitch
    pitch = startPitch - deltaScaleY * (minPitch - startPitch);
  }

  return viewState.getUpdatedState({bearing, pitch});
}

// Zoom
// @param {[Number, Number]} pos - position on screen where the current center is
// @param {[Number, Number]} startPos - the center position at
//   the start of the operation. Must be supplied of `zoomStart()` was not called
// @param {Number} scale - a number between [0, 1] specifying the accumulated
//   relative scale.
function zoomTo(viewState, {controller, pos, startPos, scale, startViewState}) {
  assert(scale > 0, '`scale` must be a positive number');

  // Make sure we zoom around the current mouse position rather than map center
  // startZoomLngLat: viewState._unproject(pos),
  const startZoomLngLat = controller.unproject(startPos) || controller.unproject(pos);

  let startZoom = startViewState.props.zoom;

  if (!Number.isFinite(startZoom)) {
    startZoom = viewState.props.zoom;
  }

  // take the start lnglat and put it where the mouse is down.
  const newZoom = startZoom + Math.log2(scale);
  const zoomedViewport = new WebMercatorViewport(
    Object.assign({}, viewState.props, {
      zoom: newZoom
    })
  );
  const [longitude, latitude] = zoomedViewport.getLocationAtPoint({lngLat: startZoomLngLat, pos});

  return viewState.getUpdatedState({
    zoom: newZoom, // Rely on constraints being applied
    longitude,
    latitude
  });
}

function zoomIn(viewState) {
  return viewState.getUpdatedState({
    zoom: viewState.props.zoom + 0.2
  });
}

function zoomOut(viewState) {
  return viewState.getUpdatedState({
    zoom: viewState.props.zoom - 0.2
  });
}

function moveLeft(viewState) {
  return viewState.getUpdatedState({
    bearing: viewState.props.bearing - 3
  });
}

function moveRight(viewState) {
  return viewState.getUpdatedState({
    bearing: viewState.props.bearing + 3
  });
}

function moveForward(viewState) {
  return viewState.getUpdatedState({
    pitch: viewState.props.pitch + 3
  });
}

function moveBackward(viewState) {
  return viewState.getUpdatedState({
    pitch: viewState.props.pitch - 3
  });
}

export const EVENT_REDUCERS = {
  // panStart,
  pan,
  // panEnd,
  // rotateStart,
  rotate,
  // rotateEnd,
  // zoomStart,
  zoom: zoomTo,
  // zoomEnd,
  zoomIn,
  zoomOut,
  moveLeft,
  moveRight,
  moveForward,
  moveBackward
};

// A class that handles events and updates mercator style viewport parameters
export default class MapController extends Controller {
  constructor(options) {
    // Register map specific "ViewState + event -> ViewState" reducers
    super(options, {
      defaultReducers: EVENT_REDUCERS,
      defaultConstraints: MAPBOX_LIMITS
    });
  }

  getViewportProps(viewState) {
    return this._applyConstraints(viewState, this.limits);
  }

  _applyConstraints(viewState, constraints) {
    const {width, height} = this.getSize();

    const {
      longitude,
      latitude,
      zoom,
      pitch = 0,
      bearing = 0,
      altitude = 1.5,

      maxZoom,
      minZoom,
      maxPitch,
      minPitch,
      maxLatitude,
      minLatitude
    } = Object.assign({}, constraints, viewState.props);

    const props = {
      width,
      height,
      longitude,
      latitude,
      zoom,
      pitch,
      bearing,
      altitude,
      maxZoom,
      minZoom,
      maxPitch,
      minPitch,
      maxLatitude,
      minLatitude
    };

    props.longitude = normalizeDegrees(props.longitude);
    props.bearing = normalizeDegrees(props.bearing);
    props.zoom = clamp(zoom, minZoom, maxZoom);
    props.pitch = clamp(pitch, minPitch, maxPitch);

    return normalizeViewportProps(props);
  }

  // Override selected event-to-reducer mappings

  // Map specific handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }

    const {width, height} = this.getSize();

    const {deltaX, deltaY} = event;
    const [, centerY] = this.getCenter(event);
    const startY = centerY - deltaY;

    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;

    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to -1 as we drag upwards
        deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        deltaScaleY = 1 - centerY / startY;
      }
    }
    deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

    const parameters = this._getReducerParameters({deltaScaleX, deltaScaleY});

    const newMapState = rotate(this.viewState, parameters);
    return this.updateViewport(newMapState);
  }
}
