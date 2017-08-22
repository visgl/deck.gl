import FirstPersonViewport from '../viewports/first-person-viewport';
import {Vector3, experimental} from 'math.gl';
const {SphericalCoordinates} = experimental;
import assert from 'assert';

const MOVEMENT_SPEED = 2;  // 1 meter per keyboard click
// const ROTATION_STEP_RADIANS = 0.03;
const ROTATION_STEP_DEGREES = 3;
const Y_AXIS_INVERSION = [1, -1, 1];

const defaultState = {
  position: [0, 0, 0],
  lookAt: [0, 0, 0],
  up: [0, 1, 0],

  rotationX: 0,
  rotationY: 0,

  fov: 50,
  near: 1,
  far: 100
};

/* Helpers */

// Constrain number between bounds
function clamp(x, min, max) {
  return x < min ? min : (x > max ? max : x);
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

export default class FirstPersonState {

  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport

    // Position and orientation
    position, // typically in meters from anchor point
    direction,

    bearing, // Rotation around y axis
    pitch, // Rotation around x axis
    zoom,

    syncBearing = true, // Whether to lock bearing to direction

    // Constraints - simple movement limit
    // Bounding box of the world, in the shape of {minX, maxX, minY, maxY, minZ, maxZ}
    bounds,

    /** Interaction states, required to calculate change during transform */
    // Model state when the pan operation first started
    startPanEventPosition,
    startPanPosition,

    // Model state when the rotate operation first started
    startRotateCenter,
    startRotateViewport,

    // Model state when the zoom operation first started
    startZoomPos,
    startZoom
  }) {
    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    // assert(Number.isFinite(distance), '`distance` must be supplied');

    bearing = ensureFinite(bearing, defaultState.bearing);

    this._viewportProps = this._applyConstraints({
      width,
      height,
      position: new Vector3(
        ensureFinite(position[0], defaultState.position[0]),
        ensureFinite(position[1], defaultState.position[1]),
        ensureFinite(position[2], defaultState.position[2])
      ),
      direction: this._getDirectionFromBearing(bearing),
      bearing,
      pitch: ensureFinite(pitch, defaultState.pitch),
      zoom,
      bounds
    });

    this._interactiveState = {
      startPanEventPosition,
      startPanPosition,
      startRotateCenter,
      startRotateViewport,
      startZoomPos,
      startZoom
    };
  }

  /* Public API */

  getViewport() {
    return new FirstPersonViewport(this._viewportProps);
  }

  getViewportProps() {
    return this._viewportProps;
  }

  getInteractiveState() {
    return this._interactiveState;
  }

  getLookAt() {
    return [];
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}) {
    const {translationX, translationY} = this._viewportProps;

    return this._getUpdatedState({
      startPanPosition: [translationX, translationY],
      startPanEventPosition: pos
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPos}) {
    const startPanEventPosition = this._interactiveState.startPanEventPosition || startPos;
    assert(startPanEventPosition, '`startPanEventPosition` props is required');

    let [translationX, translationY] = this._interactiveState.startPanPosition || [];
    translationX = ensureFinite(translationX, this._viewportProps.translationX);
    translationY = ensureFinite(translationY, this._viewportProps.translationY);

    const deltaX = pos[0] - startPanEventPosition[0];
    const deltaY = pos[1] - startPanEventPosition[1];

    return this._getUpdatedState({
      translationX: translationX + deltaX,
      translationY: translationY - deltaY
    });
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanPosition: null,
      startPanPos: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}) {
    return this._getUpdatedState({
      startRotateCenter: this._viewportProps.position,
      startRotateViewport: this._viewportProps
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({deltaScaleX, deltaScaleY}) {
    const {startRotateCenter, startRotateViewport} = this._interactiveState;

    let {rotationX, rotationY, translationX, translationY} = startRotateViewport || {};
    rotationX = ensureFinite(rotationX, this._viewportProps.rotationX);
    rotationY = ensureFinite(rotationY, this._viewportProps.rotationY);
    translationX = ensureFinite(translationX, this._viewportProps.translationX);
    translationY = ensureFinite(translationY, this._viewportProps.translationY);

    const newRotationX = clamp(rotationX - deltaScaleY * 180, -89.999, 89.999);
    const newRotationY = (rotationY - deltaScaleX * 180) % 360;

    let newTranslationX = translationX;
    let newTranslationY = translationY;

    if (startRotateCenter) {
      // Keep rotation center at the center of the screen
      const oldViewport = new FirstPersonViewport(startRotateViewport);
      const oldCenterPos = oldViewport.project(startRotateCenter);

      const newViewport = new FirstPersonViewport(Object.assign({}, startRotateViewport, {
        rotationX: newRotationX,
        rotationY: newRotationY
      }));
      const newCenterPos = newViewport.project(startRotateCenter);

      newTranslationX += oldCenterPos[0] - newCenterPos[0];
      newTranslationY -= oldCenterPos[1] - newCenterPos[1];
    }

    const {direction} = this._viewportProps;

    return this._getUpdatedState({
      direction: new Vector3(direction).rotateZ({radians: deltaScaleX / 50}),
      rotationX: newRotationX,
      rotationY: newRotationY,
      translationX: newTranslationX,
      translationY: newTranslationY
    });
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startRotateCenter: null,
      startRotateViewport: null
    });
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}) {
    return this._getUpdatedState({
      startZoomPos: pos,
      startZoom: this._viewportProps.zoom
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
  zoom({pos, startPos, scale}) {
    const {zoom, minZoom, maxZoom, width, height, translationX, translationY} = this._viewportProps;

    const startZoomPos = this._interactiveState.startZoomPos || startPos || pos;

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

    // return this._getUpdatedState({
    //   position
    //   translationX: newTranslationX,
    //   translationY: newTranslationY
    // });

    // TODO HACK
    return newZoom / zoom < 1 ? this.moveBackward() : this.moveForward();
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomPos: null,
      startZoom: null
    });
  }

  _getDirectionFromBearing(bearing) {
    const spherical = new SphericalCoordinates({bearing, pitch: 90});
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  moveLeft() {
    // const {position, direction} = this._viewportProps;
    // const newDirection = new Vector3(direction).rotateZ({radians: ROTATION_STEP_RADIANS});
    // return this._getUpdatedState({
    //   direction: newDirection,
    //   lookAt: new Vector3(position).add(newDirection.normalize()),
    //   bearing: this._viewportProps.bearing - ROTATION_STEP_DEGREES
    // });

    const {position, bearing} = this._viewportProps;
    const newBearing = bearing - ROTATION_STEP_DEGREES;
    const newDirection = this._getDirectionFromBearing(newBearing);
    return this._getUpdatedState({
      direction: newDirection,
      lookAt: new Vector3(position).add(newDirection),
      bearing: newBearing
    });
  }

  moveRight() {
    // const {position, direction} = this._viewportProps;
    // const newDirection = new Vector3(direction).rotateZ({radians: -ROTATION_STEP_RADIANS});
    // return this._getUpdatedState({
    //   direction: newDirection,
    //   lookAt: new Vector3(position).add(newDirection.normalize()),
    //   bearing: this._viewportProps.bearing + ROTATION_STEP_DEGREES
    // });

    const {position, bearing} = this._viewportProps;
    const newBearing = bearing + ROTATION_STEP_DEGREES;
    const newDirection = this._getDirectionFromBearing(newBearing);
    return this._getUpdatedState({
      direction: newDirection,
      lookAt: new Vector3(position).add(newDirection),
      bearing: newBearing
    });
  }

  moveForward() {
    const {position, direction} = this._viewportProps;
    const delta = new Vector3(direction).normalize().scale(MOVEMENT_SPEED);
    return this._getUpdatedState({
      // pitch: this._viewportProps.pitch + 3
      position: new Vector3(position).add(delta),
      lookAt: new Vector3(position).add(direction)
    });
  }

  moveBackward() {
    const {position, direction} = this._viewportProps;
    const delta = new Vector3(direction).normalize().scale(-MOVEMENT_SPEED);
    return this._getUpdatedState({
      // pitch: this._viewportProps.pitch - 3
      position: new Vector3(position).add(delta),
      lookAt: new Vector3(position).add(direction)
    });
  }

  zoomIn() {
    return this._getUpdatedState({
      zoom: this._viewportProps.zoom + 0.2
    });
  }

  zoomOut() {
    return this._getUpdatedState({
      zoom: this._viewportProps.zoom - 0.2
    });
  }

  /* Private methods */

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new FirstPersonState(
      Object.assign({}, this._viewportProps, this._interactiveState, newProps)
    );
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // TODO/ib - Ensure position is within bounds
    return props;
  }
}
