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
import OrbitViewport from '../viewports/orbit-viewport';
import {clamp} from 'math.gl';

// Event reducers

/**
 * Pan
 * @param {[Number, Number]} pos - position on screen where the pointer is
 */
function pan(viewState, {startViewState, pos, startPos}) {
  const deltaX = pos[0] - startPos[0];
  const deltaY = pos[1] - startPos[1];

  const viewport = new OrbitViewport(startViewState.props);
  const center = viewport.project(viewport.lookAt);
  const newLookAt = viewport.unproject([center[0] - deltaX, center[1] - deltaY, center[2]]);

  return viewState.getUpdatedState({
    lookAt: newLookAt
  });
}

/**
 * Rotate
 * @param {[Number, Number]} pos - position on screen where the pointer is
 */
function rotate(viewState, {startViewState, deltaScaleX, deltaScaleY}) {
  const {rotationX, rotationOrbit} = startViewState.props;

  return viewState.getUpdatedState({
    rotationX: clamp(rotationX - deltaScaleY * 180, -89.999, 89.999),
    rotationOrbit: (rotationOrbit - deltaScaleX * 180) % 360
  });
}

/**
 * Zoom
 * @param {[Number, Number]} pos - position on screen where the current center is
 * @param {[Number, Number]} startPos - the center position at
 *   the start of the operation. Must be supplied of `zoomStart()` was not called
 * @param {Number} scale - a number between [0, 1] specifying the accumulated
 *   relative scale.
 */
function zoomTo(viewState, {startViewState, pos, startPos, scale, controller, width, height}) {
  const {zoom} = viewState.props;

  const startZoomPos = startPos;
  const newZoom = zoom * scale;
  // newZoom = clamp(newZoom, minZoom, maxZoom);
  const deltaX = pos[0] - startZoomPos[0];
  const deltaY = pos[1] - startZoomPos[1];

  // Zoom around the center position
  const cx = startZoomPos[0] - width / 2;
  const cy = height / 2 - startZoomPos[1];

  const viewport = new OrbitViewport(startViewState.props);
  const center = viewport.project(viewState.props.lookAt);
  const newCenterX = center[0] - cx + cx * newZoom / zoom + deltaX;
  const newCenterY = center[1] + cy - cy * newZoom / zoom - deltaY;

  const newLookAt = viewport.unproject([newCenterX, newCenterY, center[2]]);

  return viewState.getUpdatedState({
    lookAt: newLookAt,
    zoom: newZoom
  });
}

const defaultReducers = {
  // panStart,
  pan,
  // panEnd,
  // rotateStart,
  rotate,
  // rotateEnd,
  zoom: zoomTo
  // zoomIn,
  // zoomOut,
  // moveUp,
  // moveDown,
  // moveLeft,
  // moveRight,
  // moveForward,
  // moveBackward
};

// A class that handles events based on an "orbit" interaction model
export default class OrbitController extends Controller {
  constructor(options) {
    // Register map specific "ViewState + event -> ViewState" reducers
    super(options, {defaultReducers});
  }

  getViewportProps(viewState) {
    const {
      width,
      height,
      distance,
      rotationX = 0,
      rotationOrbit = 0,
      orbitAxis = 'Z',
      lookAt = [0, 0, 0],
      up = [0, 1, 0],
      fov = 75,
      near = 1,
      far = 100,
      zoom = 1
    } = viewState.props;

    return {
      width,
      height,
      distance,
      rotationX,
      rotationOrbit,
      orbitAxis,
      lookAt,
      up,
      fov,
      near,
      far,
      zoom
    };
  }
}
