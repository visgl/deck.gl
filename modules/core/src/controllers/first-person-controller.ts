import Controller from './controller';
import ViewState from './view-state';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';

import {Vector3, _SphericalCoordinates as SphericalCoordinates, clamp} from '@math.gl/core';

const MOVEMENT_SPEED = 20;

type FirstPersonStateProps = {
  width: number;
  height: number;

  position?: number[];
  bearing?: number;
  pitch?: number;

  // Geospatial anchor
  longitude?: number | null;
  latitude?: number | null;

  maxPitch?: number;
  minPitch?: number;
};

type FirstPersonStateInternal = {
  startRotatePos?: [number, number];
  startBearing?: number;
  startPitch?: number;
  startZoomPosition?: number[];
};

class FirstPersonState extends ViewState<
  FirstPersonState,
  FirstPersonStateProps,
  FirstPersonStateInternal
> {
  constructor(options: FirstPersonStateProps & FirstPersonStateInternal) {
    const {
      /* Viewport arguments */
      width, // Width of viewport
      height, // Height of viewport

      // Position and orientation
      position = [0, 0, 0], // typically in meters from anchor point

      bearing = 0, // Rotation around y axis
      pitch = 0, // Rotation around x axis

      // Geospatial anchor
      longitude = null,
      latitude = null,

      maxPitch = 90,
      minPitch = -90,

      // Model state when the rotate operation first started
      startRotatePos,
      startBearing,
      startPitch,
      startZoomPosition
    } = options;

    super(
      {
        width,
        height,
        position,
        bearing,
        pitch,
        longitude,
        latitude,
        maxPitch,
        minPitch
      },
      {
        startRotatePos,
        startBearing,
        startPitch,
        startZoomPosition
      }
    );
  }

  /* Public API */

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart(): FirstPersonState {
    return this;
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan(): FirstPersonState {
    return this;
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): FirstPersonState {
    return this;
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}: {pos: [number, number]}): FirstPersonState {
    return this._getUpdatedState({
      startRotatePos: pos,
      startBearing: this.getViewportProps().bearing,
      startPitch: this.getViewportProps().pitch
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({
    pos,
    deltaAngleX = 0,
    deltaAngleY = 0
  }: {
    pos?: [number, number];
    deltaAngleX?: number;
    deltaAngleY: number;
  }): FirstPersonState {
    const {startRotatePos, startBearing, startPitch} = this.getState();
    const {width, height} = this.getViewportProps();

    if (!startRotatePos || startBearing === undefined || startPitch === undefined) {
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
  rotateEnd(): FirstPersonState {
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
  zoomStart(): FirstPersonState {
    return this._getUpdatedState({
      startZoomPosition: this.getViewportProps().position
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
  zoom({scale}: {scale: number}): FirstPersonState {
    let {startZoomPosition} = this.getState();
    if (!startZoomPosition) {
      startZoomPosition = this.getViewportProps().position;
    }

    const direction = this.getDirection();
    return this._move(direction, Math.log2(scale) * MOVEMENT_SPEED, startZoomPosition);
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): FirstPersonState {
    return this._getUpdatedState({
      startZoomPosition: null
    });
  }

  moveLeft(speed: number = MOVEMENT_SPEED): FirstPersonState {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: Math.PI / 2}), speed);
  }

  moveRight(speed: number = MOVEMENT_SPEED): FirstPersonState {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({radians: -Math.PI / 2}), speed);
  }

  // forward
  moveUp(speed: number = MOVEMENT_SPEED): FirstPersonState {
    const direction = this.getDirection(true);
    return this._move(direction, speed);
  }

  // backward
  moveDown(speed: number = MOVEMENT_SPEED): FirstPersonState {
    const direction = this.getDirection(true);
    return this._move(direction.negate(), speed);
  }

  rotateLeft(speed: number = 15): FirstPersonState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing - speed
    });
  }

  rotateRight(speed: number = 15): FirstPersonState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing + speed
    });
  }

  rotateUp(speed: number = 10): FirstPersonState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch + speed
    });
  }

  rotateDown(speed: number = 10): FirstPersonState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch - speed
    });
  }

  zoomIn(speed: number = 2): FirstPersonState {
    return this.zoom({scale: speed});
  }

  zoomOut(speed: number = 2): FirstPersonState {
    return this.zoom({scale: 1 / speed});
  }

  // shortest path between two view states
  shortestPathFrom(viewState: FirstPersonState) {
    const fromProps = viewState.getViewportProps();
    const props = {...this.getViewportProps()};
    const {bearing, longitude} = props;

    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (
      longitude !== null &&
      fromProps.longitude !== null &&
      Math.abs(longitude - fromProps.longitude) > 180
    ) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }

  /* Private methods */
  _move(
    direction: Vector3,
    speed: number,
    fromPosition: number[] = this.getViewportProps().position
  ) {
    const delta = direction.scale(speed);
    return this._getUpdatedState({
      position: new Vector3(fromPosition).add(delta)
    });
  }

  getDirection(use2D: boolean = false): Vector3 {
    const spherical = new SphericalCoordinates({
      bearing: this.getViewportProps().bearing,
      pitch: use2D ? 90 : 90 + this.getViewportProps().pitch
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  _getUpdatedState(newProps: Record<string, any>): FirstPersonState {
    // Update _viewportProps
    return new FirstPersonState({...this.getViewportProps(), ...this.getState(), ...newProps});
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<FirstPersonStateProps>): Required<FirstPersonStateProps> {
    // Ensure pitch and zoom are within specified range
    const {pitch, maxPitch, minPitch, longitude, bearing} = props;
    props.pitch = clamp(pitch, minPitch, maxPitch);

    // Normalize degrees
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    if (bearing < -180 || bearing > 180) {
      props.bearing = mod(bearing + 180, 360) - 180;
    }

    return props;
  }
}

export default class FirstPersonController extends Controller<FirstPersonState> {
  ControllerState = FirstPersonState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator(['position', 'pitch', 'bearing'])
  };
}
