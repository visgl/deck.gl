// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller from './controller';
import ViewState from './view-state';
import {mod} from '../utils/math-utils';

import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';

export type OrbitStateProps = {
  width: number;
  height: number;
  target?: number[];
  zoom?: number | number[];
  rotationX?: number;
  rotationOrbit?: number;

  /** Viewport constraints */
  maxZoom?: number;
  minZoom?: number;
  minRotationX?: number;
  maxRotationX?: number;
};

type OrbitStateInternal = {
  startPanPosition?: number[];
  startRotatePos?: number[];
  startRotationX?: number;
  startRotationOrbit?: number;
  startZoomPosition?: number[];
  startZoom?: number | number[];
};

export class OrbitState extends ViewState<OrbitState, OrbitStateProps, OrbitStateInternal> {
  makeViewport: (props: Record<string, any>) => Viewport;

  constructor(
    options: OrbitStateProps &
      OrbitStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  ) {
    const {
      /* Viewport arguments */
      width, // Width of viewport
      height, // Height of viewport
      rotationX = 0, // Rotation around x axis
      rotationOrbit = 0, // Rotation around orbit axis
      target = [0, 0, 0],
      zoom = 0,

      /* Viewport constraints */
      minRotationX = -90,
      maxRotationX = 90,
      minZoom = -Infinity,
      maxZoom = Infinity,

      /** Interaction states, required to calculate change during transform */
      // Model state when the pan operation first started
      startPanPosition,
      // Model state when the rotate operation first started
      startRotatePos,
      startRotationX,
      startRotationOrbit,
      // Model state when the zoom operation first started
      startZoomPosition,
      startZoom
    } = options;

    super(
      {
        width,
        height,
        rotationX,
        rotationOrbit,
        target,
        zoom,
        minRotationX,
        maxRotationX,
        minZoom,
        maxZoom
      },
      {
        startPanPosition,
        startRotatePos,
        startRotationX,
        startRotationOrbit,
        startZoomPosition,
        startZoom
      }
    );

    this.makeViewport = options.makeViewport;
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}: {pos: [number, number]}): OrbitState {
    return this._getUpdatedState({
      startPanPosition: this._unproject(pos)
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPosition}: {pos: [number, number]; startPosition?: number[]}): OrbitState {
    const startPanPosition = this.getState().startPanPosition || startPosition;

    if (!startPanPosition) {
      return this;
    }

    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(startPanPosition, pos);

    return this._getUpdatedState(newProps);
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): OrbitState {
    return this._getUpdatedState({
      startPanPosition: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}: {pos: [number, number]}): OrbitState {
    return this._getUpdatedState({
      startRotatePos: pos,
      startRotationX: this.getViewportProps().rotationX,
      startRotationOrbit: this.getViewportProps().rotationOrbit
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
    deltaAngleY?: number;
  }): OrbitState {
    const {startRotatePos, startRotationX, startRotationOrbit} = this.getState();
    const {width, height} = this.getViewportProps();

    if (!startRotatePos || startRotationX === undefined || startRotationOrbit === undefined) {
      return this;
    }

    let newRotation;
    if (pos) {
      let deltaScaleX = (pos[0] - startRotatePos[0]) / width;
      const deltaScaleY = (pos[1] - startRotatePos[1]) / height;

      if (startRotationX < -90 || startRotationX > 90) {
        // When looking at the "back" side of the scene, invert horizontal drag
        // so that the camera movement follows user input
        deltaScaleX *= -1;
      }
      newRotation = {
        rotationX: startRotationX + deltaScaleY * 180,
        rotationOrbit: startRotationOrbit + deltaScaleX * 180
      };
    } else {
      newRotation = {
        rotationX: startRotationX + deltaAngleY,
        rotationOrbit: startRotationOrbit + deltaAngleX
      };
    }

    return this._getUpdatedState(newRotation);
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd(): OrbitState {
    return this._getUpdatedState({
      startRotationX: null,
      startRotationOrbit: null
    });
  }

  // shortest path between two view states
  shortestPathFrom(viewState: OrbitState): OrbitStateProps {
    const fromProps = viewState.getViewportProps();
    const props = {...this.getViewportProps()};
    const {rotationOrbit} = props;

    if (Math.abs(rotationOrbit - fromProps.rotationOrbit) > 180) {
      props.rotationOrbit = rotationOrbit < 0 ? rotationOrbit + 360 : rotationOrbit - 360;
    }

    return props;
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}: {pos: [number, number]}): OrbitState {
    return this._getUpdatedState({
      startZoomPosition: this._unproject(pos),
      startZoom: this.getViewportProps().zoom
    });
  }

  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current target is
   * @param {[Number, Number]} startPos - the target position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): OrbitState {
    let {startZoom, startZoomPosition} = this.getState();
    if (!startZoomPosition) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = this.getViewportProps().zoom;
      startZoomPosition = this._unproject(startPos) || this._unproject(pos);
    }
    if (!startZoomPosition) {
      return this;
    }
    const newZoom = this._calculateNewZoom({scale, startZoom});
    const zoomedViewport = this.makeViewport({...this.getViewportProps(), zoom: newZoom});

    return this._getUpdatedState({
      zoom: newZoom,
      ...zoomedViewport.panByPosition(startZoomPosition, pos)
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): OrbitState {
    return this._getUpdatedState({
      startZoomPosition: null,
      startZoom: null
    });
  }

  zoomIn(speed: number = 2): OrbitState {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({scale: speed})
    });
  }

  zoomOut(speed: number = 2): OrbitState {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({scale: 1 / speed})
    });
  }

  moveLeft(speed: number = 50): OrbitState {
    return this._panFromCenter([-speed, 0]);
  }

  moveRight(speed: number = 50): OrbitState {
    return this._panFromCenter([speed, 0]);
  }

  moveUp(speed: number = 50): OrbitState {
    return this._panFromCenter([0, -speed]);
  }

  moveDown(speed: number = 50): OrbitState {
    return this._panFromCenter([0, speed]);
  }

  rotateLeft(speed: number = 15): OrbitState {
    return this._getUpdatedState({
      rotationOrbit: this.getViewportProps().rotationOrbit - speed
    });
  }

  rotateRight(speed: number = 15): OrbitState {
    return this._getUpdatedState({
      rotationOrbit: this.getViewportProps().rotationOrbit + speed
    });
  }

  rotateUp(speed: number = 10): OrbitState {
    return this._getUpdatedState({
      rotationX: this.getViewportProps().rotationX - speed
    });
  }

  rotateDown(speed: number = 10): OrbitState {
    return this._getUpdatedState({
      rotationX: this.getViewportProps().rotationX + speed
    });
  }

  /* Private methods */

  _unproject(pos?: number[]): number[] | undefined {
    const viewport = this.makeViewport(this.getViewportProps());
    // @ts-ignore
    return pos && viewport.unproject(pos);
  }

  // Calculates new zoom
  _calculateNewZoom({
    scale,
    startZoom
  }: {
    scale: number;
    startZoom?: number | number[];
  }): number | number[] {
    const {maxZoom, minZoom} = this.getViewportProps();
    if (startZoom === undefined) {
      startZoom = this.getViewportProps().zoom;
    }
    const zoom = (startZoom as number) + Math.log2(scale);
    return clamp(zoom, minZoom, maxZoom);
  }

  _panFromCenter(offset) {
    const {width, height, target} = this.getViewportProps();
    return this.pan({
      startPosition: target,
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }

  _getUpdatedState(newProps): OrbitState {
    // @ts-ignore
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<OrbitStateProps>): Required<OrbitStateProps> {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom, maxRotationX, minRotationX, rotationOrbit} = props;

    props.zoom = Array.isArray(zoom)
      ? [clamp(zoom[0], minZoom, maxZoom), clamp(zoom[1], minZoom, maxZoom)]
      : clamp(zoom, minZoom, maxZoom);

    props.rotationX = clamp(props.rotationX, minRotationX, maxRotationX);
    if (rotationOrbit < -180 || rotationOrbit > 180) {
      props.rotationOrbit = mod(rotationOrbit + 180, 360) - 180;
    }

    return props;
  }
}

export default class OrbitController extends Controller<OrbitState> {
  ControllerState = OrbitState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator({
      transitionProps: {
        compare: ['target', 'zoom', 'rotationX', 'rotationOrbit'],
        required: ['target', 'zoom']
      }
    })
  };
}
