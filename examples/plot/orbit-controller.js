/* global window */
import React, {Component, PropTypes} from 'react';
import {PerspectiveViewport} from 'deck.gl';
import {vec3} from 'gl-matrix';

/* Utils */

// constrain number between bounds
function clamp(x, min, max) {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}

const ua = typeof window.navigator !== 'undefined' ?
  window.navigator.userAgent.toLowerCase() : '';
const firefox = ua.indexOf('firefox') !== -1;

/* Interaction */

export default class OrbitController extends Component {

  static getViewport({width, height, lookAt, distance, rotationX, rotationY, fov}) {
    const cameraPos = vec3.add([], lookAt, [0, 0, distance]);
    vec3.rotateX(cameraPos, cameraPos, lookAt, rotationX / 180 * Math.PI);
    vec3.rotateY(cameraPos, cameraPos, lookAt, rotationY / 180 * Math.PI);

    return new PerspectiveViewport({
      width,
      height,
      lookAt,
      far: 1000,
      near: 0.1,
      fovy: fov,
      eye: cameraPos
    });
  }

  constructor(props) {
    super(props);
    this._dragStartPos = null;
  }

  _onDragStart(evt) {
    const {pageX, pageY} = evt;
    this._dragStartPos = [pageX, pageY];
    this.props.onChangeViewport({isDragging: true});
  }

  _onDrag(evt) {
    if (this._dragStartPos) {
      const {pageX, pageY} = evt;
      const {width, height} = this.props;
      const dx = (pageX - this._dragStartPos[0]) / width;
      const dy = (pageY - this._dragStartPos[1]) / height;

      if (evt.shiftKey || evt.ctrlKey || evt.altKey || evt.metaKey) {
        // pan
        const {lookAt, distance, rotationX, rotationY, fov} = this.props;

        const unitsPerPixel = distance / Math.tan(fov / 180 * Math.PI / 2) / 2;

        const newLookAt = vec3.add([], lookAt, [-unitsPerPixel * dx, unitsPerPixel * dy, 0]);
        vec3.rotateX(newLookAt, newLookAt, lookAt, rotationX / 180 * Math.PI);
        vec3.rotateY(newLookAt, newLookAt, lookAt, rotationY / 180 * Math.PI);

        this.props.onChangeViewport({
          lookAt: newLookAt
        });
      } else {
        // rotate
        const {rotationX, rotationY} = this.props;
        const newRotationX = clamp(rotationX - dy * 180, -90, 90);
        const newRotationY = (rotationY - dx * 180) % 360;

        this.props.onChangeViewport({
          rotationX: newRotationX,
          rotationY: newRotationY
        });
      }

      this._dragStartPos = [pageX, pageY];
    }
  }

  _onDragEnd() {
    this._dragStartPos = null;
    this.props.onChangeViewport({isDragging: false});
  }

  _onWheel(evt) {
    evt.preventDefault();
    let value = evt.deltaY;
    // Firefox doubles the values on retina screens...
    if (firefox && evt.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
      value /= window.devicePixelRatio;
    }
    if (evt.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
      value *= 40;
    }
    if (value !== 0 && value % 4.000244140625 === 0) {
      // This one is definitely a mouse wheel event.
      // Normalize this value to match trackpad.
      value = Math.floor(value / 4);
    }

    const {distance, minDistance, maxDistance} = this.props;
    const newDistance = clamp(distance * Math.pow(1.01, value), minDistance, maxDistance);

    this.props.onChangeViewport({
      distance: newDistance
    });
  }

  // public API
  fitBounds(min, max) {
    const {fov} = this.props;
    const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    const newDistance = size / Math.tan(fov / 180 * Math.PI / 2) / 2;

    this.props.onChangeViewport({
      distance: newDistance
    });
  }

  render() {
    return (
      <div style={{position: 'relative', userSelect: 'none'}}
        onMouseDown={this._onDragStart.bind(this)}
        onMouseMove={this._onDrag.bind(this)}
        onMouseLeave={this._onDragEnd.bind(this)}
        onMouseUp={this._onDragEnd.bind(this)}
        onWheel={this._onWheel.bind(this)} >

        {this.props.children}

      </div>);
  }
}

OrbitController.propTypes = {
  // target position
  lookAt: PropTypes.arrayOf(PropTypes.number),
  // camera distance
  distance: PropTypes.number.isRequired,
  minDistance: PropTypes.number,
  maxDistance: PropTypes.number,
  // rotation
  rotationX: PropTypes.number,
  rotationY: PropTypes.number,
  // field of view
  fov: PropTypes.number,
  // viewport width in pixels
  width: PropTypes.number.isRequired,
  // viewport height in pixels
  height: PropTypes.number.isRequired,
  // callback
  onChangeViewport: PropTypes.func.isRequired
};

OrbitController.defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  minDistance: 0,
  maxDistance: Infinity,
  fov: 50
};
