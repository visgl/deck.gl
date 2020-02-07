import Controller from './controller';
import ViewState from './view-state';
import {mod} from '../utils/math-utils';

import {Vector3, _SphericalCoordinates as SphericalCoordinates, clamp} from 'math.gl';

const MOVEMENT_SPEED = 20;
const DEFAULT_STATE = {
  position: [0, 0, 0],
  pitch: 0,
  bearing: 0,
  maxPitch: 90,
  minPitch: -90
};

class FirstPersonState extends ViewState {
  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport

    // Position and orientation
    position = DEFAULT_STATE.position, // typically in meters from anchor point

    bearing = DEFAULT_STATE.bearing, // Rotation around y axis
    pitch = DEFAULT_STATE.pitch, // Rotation around x axis

    // Geospatial anchor
    longitude,
    latitude,

    maxPitch = DEFAULT_STATE.maxPitch,
    minPitch = DEFAULT_STATE.minPitch,

    // Model state when the rotate operation first started
    startBearing,
    startPitch,
    startZoomPosition,
    startZoom
  }) {
    super({
      width,
      height,
      position,
      bearing,
      pitch,
      longitude,
      latitude,
      maxPitch,
      minPitch
    });

    this._interactiveState = {
      startBearing,
      startPitch,
      startZoomPosition,
      startZoom
    };
  }

  /* Public API */

  getInteractiveState() {
    return this._interactiveState;
  }

  getDirection(use2D = false) {
    const spherical = new SphericalCoordinates({
      bearing: this._viewportProps.bearing,
      pitch: use2D ? 90 : 90 + this._viewportProps.pitch
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart() {
    return this;
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan() {
    return this;
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this;
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}) {
    return this._getUpdatedState({
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({deltaScaleX, deltaScaleY}) {
    const {startBearing, startPitch} = this._interactiveState;

    if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
      return this;
    }

    return this._getUpdatedState({
      bearing: startBearing - deltaScaleX * 180,
      pitch: startPitch - deltaScaleY * 90
    });
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startBearing: null,
      startPitch: null
    });
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart() {
    return this._getUpdatedState({
      startZoomPosition: this._viewportProps.position,
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
  zoom({scale}) {
    let {startZoomPosition} = this._interactiveState;
    if (!startZoomPosition) {
      startZoomPosition = this._viewportProps.position;
    }

    const direction = this.getDirection();
    return this._move(direction, Math.log2(scale), startZoomPosition);
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomPosition: null,
      startZoom: null
    });
  }

  moveLeft() {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: Math.PI / 2}));
  }

  moveRight() {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: -Math.PI / 2}));
  }

  // forward
  moveUp() {
    const direction = this.getDirection(true);
    return this._move(direction);
  }

  // backward
  moveDown() {
    const direction = this.getDirection(true);
    return this._move(direction.negate());
  }

  rotateLeft() {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing - 15
    });
  }

  rotateRight() {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing + 15
    });
  }

  rotateUp() {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch + 10
    });
  }

  rotateDown() {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch - 10
    });
  }

  zoomIn() {
    return this.zoom({scale: 2});
  }

  zoomOut() {
    return this.zoom({scale: 0.5});
  }

  // shortest path between two view states
  shortestPathFrom(viewState) {
    const fromProps = viewState.getViewportProps();
    const props = Object.assign({}, this._viewportProps);
    const {bearing, longitude} = props;

    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (Math.abs(longitude - fromProps.longitude) > 180) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }

  /* Private methods */
  _move(direction, speed = 1, fromPosition = this._viewportProps.position) {
    const delta = direction.scale(speed * MOVEMENT_SPEED);
    return this._getUpdatedState({
      position: new Vector3(fromPosition).add(delta)
    });
  }

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new FirstPersonState(
      Object.assign({}, this._viewportProps, this._interactiveState, newProps)
    );
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure pitch and zoom are within specified range
    const {pitch, maxPitch, minPitch, longitude, bearing} = props;
    props.pitch = clamp(pitch, minPitch, maxPitch);

    // Normalize degrees
    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    if (bearing < -180 || bearing > 180) {
      props.bearing = mod(bearing + 180, 360) - 180;
    }

    return props;
  }
}

export default class FirstPersonController extends Controller {
  constructor(props) {
    super(FirstPersonState, props);
  }
}
