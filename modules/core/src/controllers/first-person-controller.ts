// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Controller from './controller';
import ViewState from './view-state';
import {mod} from '../utils/math-utils';
import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';

import {Vector3, _SphericalCoordinates as SphericalCoordinates, clamp} from '@math.gl/core';

const MOVEMENT_SPEED = 20;
const PAN_SPEED = 500;

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
  startPanPos?: [number, number];
  startPanPosition?: number[];
};

class FirstPersonState extends ViewState<
  FirstPersonState,
  FirstPersonStateProps,
  FirstPersonStateInternal
> {
  makeViewport: (props: Record<string, any>) => Viewport;

  constructor(
    options: FirstPersonStateProps &
      FirstPersonStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  ) {
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
      startZoomPosition,
      startPanPos,
      startPanPosition
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
        startZoomPosition,
        startPanPos,
        startPanPosition
      }
    );

    this.makeViewport = options.makeViewport;
  }

  /* Public API */

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}): FirstPersonState {
    const {position} = this.getViewportProps();
    return this._getUpdatedState({
      startPanPos: pos,
      startPanPosition: position
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos}): FirstPersonState {
    if (!pos) {
      return this;
    }
    const {startPanPos = [0, 0], startPanPosition = [0, 0]} = this.getState();
    const {width, height, bearing, pitch} = this.getViewportProps();
    const deltaScaleX = (PAN_SPEED * (pos[0] - startPanPos[0])) / width;
    const deltaScaleY = (PAN_SPEED * (pos[1] - startPanPos[1])) / height;

    const up = new SphericalCoordinates({bearing, pitch});
    const forward = new SphericalCoordinates({bearing, pitch: -90});
    const yDirection = up.toVector3().normalize();
    const xDirection = forward.toVector3().cross(yDirection).normalize();

    return this._getUpdatedState({
      position: new Vector3(startPanPosition)
        .add(xDirection.scale(deltaScaleX))
        .add(yDirection.scale(deltaScaleY))
    });
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): FirstPersonState {
    return this._getUpdatedState({
      startPanPos: null,
      startPanPosition: null
    });
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
  zoom({pos, scale}: {pos: [number, number]; scale: number}): FirstPersonState {
    const viewportProps = this.getViewportProps();
    const startZoomPosition = this.getState().startZoomPosition || viewportProps.position;
    const viewport = this.makeViewport(viewportProps);
    const {projectionMatrix, width} = viewport;
    const fovxRadians = 2.0 * Math.atan(1.0 / projectionMatrix[0]);
    const angle = fovxRadians * (pos[0] / width - 0.5);

    const direction = this.getDirection(true);
    return this._move(
      direction.rotateZ({radians: -angle}),
      Math.log2(scale) * MOVEMENT_SPEED,
      startZoomPosition
    );
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

  zoomIn(speed: number = MOVEMENT_SPEED): FirstPersonState {
    return this._move(new Vector3(0, 0, 1), speed);
  }

  zoomOut(speed: number = MOVEMENT_SPEED): FirstPersonState {
    return this._move(new Vector3(0, 0, -1), speed);
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
    return new FirstPersonState({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
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
