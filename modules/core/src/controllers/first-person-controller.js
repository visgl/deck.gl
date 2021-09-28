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
    startRotatePos,
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

    this._state = {
      startRotatePos,
      startBearing,
      startPitch,
      startZoomPosition,
      startZoom
    };
  }

  /* Public API */

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
      startRotatePos: pos,
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({pos, deltaAngleX = 0, deltaAngleY = 0}) {
    const {startRotatePos, startBearing, startPitch} = this._state;
    const {width, height} = this._viewportProps;

    if (!startRotatePos || !Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
      return this;
    }

    let newRotation;
    if (pos) {
      const deltaScaleX = (pos[0] - startRotatePos[0]) / width;
      const deltaScaleY = (pos[1] - startRotatePos[1]) / height;
      newRotation = {
        bearing: startBearing - deltaScaleX * 180,
        pitch: startPitch - deltaScaleY * 90
      };
    } else {
      newRotation = {
        bearing: startBearing - deltaAngleX,
        pitch: startPitch - deltaAngleY
      };
    }

    return this._getUpdatedState(newRotation);
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startRotatePos: null,
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
    let {startZoomPosition} = this._state;
    if (!startZoomPosition) {
      startZoomPosition = this._viewportProps.position;
    }

    const direction = this.getDirection();
    return this._move(direction, Math.log2(scale) * MOVEMENT_SPEED, startZoomPosition);
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

  moveLeft(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: Math.PI / 2}), speed);
  }

  moveRight(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: -Math.PI / 2}), speed);
  }

  // forward
  moveUp(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction, speed);
  }

  // backward
  moveDown(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.negate(), speed);
  }

  rotateLeft(speed = 15) {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing - speed
    });
  }

  rotateRight(speed = 15) {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing + speed
    });
  }

  rotateUp(speed = 10) {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch + speed
    });
  }

  rotateDown(speed = 10) {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch - speed
    });
  }

  zoomIn(speed = 2) {
    return this.zoom({scale: speed});
  }

  zoomOut(speed = 2) {
    return this.zoom({scale: 1 / speed});
  }

  // shortest path between two view states
  shortestPathFrom(viewState) {
    const fromProps = viewState.getViewportProps();
    const props = {...this._viewportProps};
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
  _move(direction, speed, fromPosition = this._viewportProps.position) {
    const delta = direction.scale(speed);
    return this._getUpdatedState({
      position: new Vector3(fromPosition).add(delta)
    });
  }

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new FirstPersonState({...this._viewportProps, ...this._state, ...newProps});
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

  get linearTransitionProps() {
    return ['position', 'pitch', 'bearing'];
  }
}
