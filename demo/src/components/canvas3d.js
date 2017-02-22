import React, {Component, PropTypes} from 'react';
import {PerspectiveViewport} from 'deck.gl';

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

// vector operations
function add(v0, v1) {
  return [
    v0[0] + v1[0],
    v0[1] + v1[1],
    v0[2] + v1[2]
  ];
}

function minus(v0, v1) {
  return [
    v0[0] - v1[0],
    v0[1] - v1[1],
    v0[2] - v1[2]
  ];
}

// rotate vector around x axis
// @param {number} angle: in degrees
function rotateX(vector, angle) {
  const r = angle / 180 * Math.PI;
  const cosA = Math.cos(r);
  const sinA = Math.sin(r);
  const [x, y, z] = vector;
  return [
    x,
    y * cosA - z * sinA,
    y * sinA + z * cosA
  ];
}

// rotate vector around y axis
// @param {number} angle: in degrees
function rotateY(vector, angle) {
  const r = angle / 180 * Math.PI;
  const cosA = Math.cos(r);
  const sinA = Math.sin(r);
  const [x, y, z] = vector;
  return [
    x * cosA + z * sinA,
    y,
    -x * sinA + z * cosA
  ];
}

const ua = typeof window.navigator !== 'undefined' ?
  window.navigator.userAgent.toLowerCase() : '';
const firefox = ua.indexOf('firefox') !== -1;

/* Interaction */

export default class Canvas3D extends Component {

  static getViewport({width, height, lookAt, distance, rotationX, rotationY, fov}) {
    let cameraDir = [0, 0, distance];
    cameraDir = rotateX(cameraDir, rotationX);
    cameraDir = rotateY(cameraDir, rotationY);
    return new PerspectiveViewport({
      width,
      height,
      lookAt,
      fovy: fov,
      eye: add(lookAt, cameraDir)
    });
  }

  constructor(props) {
    super(props);
    this._dragStartPos = null;
  }

  _onDragStart = evt => {
    const {pageX, pageY} = evt;
    this._dragStartPos = [pageX, pageY];
    this.props.onViewportChange({isDragging: true});
  }

  _onDrag = evt => {
    if (this._dragStartPos) {
      const {pageX, pageY} = evt;
      const {width, height} = this.props;
      const dx = (pageX - this._dragStartPos[0]) / width;
      const dy = (pageY - this._dragStartPos[1]) / height;

      if (evt.shiftKey) {
        // rotate
        const {rotationX, rotationY} = this.props;
        const newRotationX = clamp(rotationX - dy * 180, -90, 90);
        const newRotationY = rotationY - dx * 180;

        this.props.onViewportChange({
          rotationX: newRotationX,
          rotationY: newRotationY
        });
      } else {
        // pan
        const {lookAt, distance, rotationX, rotationY, fov} = this.props;
        
        const unitsPerPixel = distance / Math.tan(fov / 180 * Math.PI / 2) / 2;
        let translation = [-unitsPerPixel * dx, unitsPerPixel * dy, 0];
        translation = rotateX(translation, rotationX);
        translation = rotateY(translation, rotationY);
        this.props.onViewportChange({
          lookAt: add(lookAt, translation)
        });
      }

      this._dragStartPos = [pageX, pageY];
    }
  }

  _onDragEnd = () => {
    this._dragStartPos = null;
    this.props.onViewportChange({isDragging: false});
  }

  _onWheel = evt => {
    evt.preventDefault();
    let value = evt.deltaY;
    // Firefox doubles the values on retina screens...
    if (firefox && event.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
      value /= window.devicePixelRatio;
    }
    if (event.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
      value *= 40;
    }
    if (value !== 0 && value % 4.000244140625 === 0) {
      // This one is definitely a mouse wheel event.
      // Normalize this value to match trackpad.
      value = Math.floor(value / 4);
    }

    const {distance, minDistance, maxDistance} = this.props;
    const newDistance = clamp(distance * Math.pow(1.01, value), minDistance, maxDistance);

    this.props.onViewportChange({
      distance: newDistance
    });
  }

  // public API
  fitBounds(min, max) {
    const {fov} = this.props;
    const newDistance = Math.max(...minus(max, min)) / Math.tan(fov / 180 * Math.PI / 2) / 2;

    this.props.onViewportChange({
      distance: newDistance
    });
  }

  render() {
    return (
      <div
        onMouseDown={this._onDragStart}
        onMouseMove={this._onDrag}
        onMouseLeave={this._onDragEnd}
        onMouseUp={this._onDragEnd}
        onWheel={this._onWheel} >

        {this.props.children}

      </div>);
  }
}

Canvas3D.propTypes = {
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
  onViewportChange: PropTypes.func.isRequired
};

Canvas3D.defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  minDistance: 0,
  maxDistance: Infinity,
  fov: 50
};
