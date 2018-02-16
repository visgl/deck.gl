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
import {Vector3, clamp} from 'math.gl';
import assert from 'assert';

const MOVEMENT_SPEED = 1; // 1 meter per keyboard click
const ROTATION_STEP_DEGREES = 2;

/* Helpers */

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

// Event reducers

// Pan
// @param {[Number, Number]} pos - position on screen where the pointer is
function pan(viewState, {controller, pos, startPos}) {
  const startPanEventPosition = controller.state.startPanEventPosition || startPos;
  assert(startPanEventPosition, '`startPanEventPosition` props is required');

  let [translationX, translationY] = controller.state.startPanPosition || [];
  translationX = ensureFinite(translationX, viewState.translationX);
  translationY = ensureFinite(translationY, viewState.translationY);

  const deltaX = pos[0] - startPanEventPosition[0];
  const deltaY = pos[1] - startPanEventPosition[1];

  return viewState.getUpdatedState({
    translationX: translationX + deltaX,
    translationY: translationY - deltaY
  });
}

// Rotate
// @param {[Number, Number]} pos - position on screen where the pointer is
function rotate(viewState, {deltaScaleX, deltaScaleY}) {
  return viewState.getUpdatedState({
    bearing: viewState.bearing + deltaScaleX * 10,
    pitch: viewState.pitch - deltaScaleY * 10
  });
}

// Zoom
// @param {[Number, Number]} pos - position on screen where the current center is
// @param {[Number, Number]} startPos - the center position at
//   the start of the operation. Must be supplied of `zoomStart()` was not called
// @param {Number} scale - a number between [0, 1] specifying the accumulated
//   relative scale.
function zoomTo(viewState, {controller, pos, startPos, scale}) {
  const {zoom, minZoom, maxZoom, width, height, translationX, translationY} = viewState;

  const startZoomPos = controller.state.startZoomPos || startPos || pos;

  const newZoom = clamp(zoom * scale, minZoom, maxZoom);
  const deltaX = pos[0] - startZoomPos[0];
  const deltaY = pos[1] - startZoomPos[1];

  // Zoom around the center position
  const cx = startZoomPos[0] - width / 2;
  const cy = height / 2 - startZoomPos[1];
  /* eslint-disable no-unused-vars */
  const newTranslationX = cx - (cx - translationX) * newZoom / zoom + deltaX;
  const newTranslationY = cy - (cy - translationY) * newZoom / zoom - deltaY;
  /* eslint-enable no-unused-vars */

  // return viewState.getUpdatedState({
  //   position
  //   translationX: newTranslationX,
  //   translationY: newTranslationY
  // });

  // TODO HACK
  return newZoom / zoom < 1
    ? moveBackward(viewState, controller)
    : moveForward(viewState, controller);
}

function zoomIn(viewState, controller) {
  return viewState.getUpdatedState({
    zoom: viewState.zoom + 0.2
  });
}

function zoomOut(viewState, controller) {
  return viewState.getUpdatedState({
    zoom: viewState.zoom - 0.2
  });
}

function moveLeft(viewState, controller) {
  return viewState.getUpdatedState({
    bearing: viewState.getBearing() - ROTATION_STEP_DEGREES
  });
}

function moveRight(viewState, controller) {
  return viewState.getUpdatedState({
    bearing: viewState.getBearing() + ROTATION_STEP_DEGREES
  });
}

function moveForward(viewState, controller) {
  const position = viewState.getPosition();
  const direction = viewState.getDirection();
  const delta = new Vector3(direction).normalize().scale(MOVEMENT_SPEED);
  return viewState.getUpdatedState({
    position: new Vector3(position).add(delta)
  });
}

function moveBackward(viewState, controller) {
  const position = viewState.getPosition();
  const direction = viewState.getDirection();
  const delta = new Vector3(direction).normalize().scale(-MOVEMENT_SPEED);
  return viewState.getUpdatedState({
    position: new Vector3(position).add(delta)
  });
}

function moveUp(viewState, controller) {
  const position = viewState.getPosition();
  const delta = [0, 0, 1];
  return viewState.getUpdatedState({
    position: new Vector3(position).add(delta)
  });
}

function moveDown(viewState, controller) {
  const position = viewState.getPosition();
  const delta = position[2] >= 1 ? [0, 0, -1] : [0, 0, 0];
  return viewState.getUpdatedState({
    position: new Vector3(position).add(delta)
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
  zoomTo,
  // zoomEnd,
  zoomIn,
  zoomOut,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  moveForward,
  moveBackward
};

// A class that handles events based on a first person interaction model
export default class FirstPersonController extends Controller {
  constructor(options) {
    // Register map specific "ViewState + event -> ViewState" reducers
    super(options, {defaultReducers: EVENT_REDUCERS});
  }
}
