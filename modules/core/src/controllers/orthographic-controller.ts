// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import ViewState from './view-state';

import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';
import type {MjolnirGestureEvent} from 'mjolnir.js';

// Only gesture and transition targets may temporarily exceed maxBounds.
const RUBBER_BAND_TARGETS = new WeakSet<number[]>();

class RubberBandInterpolator extends LinearInterpolator {
  private target: number[];

  constructor(target: number[]) {
    super(['target', 'zoomX', 'zoomY']);
    this.target = target;
  }

  override interpolateProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>,
    t: number
  ): Record<string, any> {
    const props = super.interpolateProps(startProps, endProps, t);
    if (t < 1) {
      props.target = this.target.map(
        (value: number, index: number) =>
          (1 - t) * (1 - t) * (startProps.target[index] ?? value) +
          2 * (1 - t) * t * value +
          t * t * (endProps.target[index] ?? value)
      );
      RUBBER_BAND_TARGETS.add(props.target);
    }
    return props;
  }
}

export type OrthographicStateProps = {
  width: number;
  height: number;
  target?: number[];
  zoom?: number | number[];
  zoomX?: number;
  zoomY?: number;
  zoomAxis?: 'X' | 'Y' | 'all';

  /** Viewport constraints */
  maxZoomX?: number;
  minZoomX?: number;
  maxZoomY?: number;
  minZoomY?: number;

  maxBounds?: ControllerProps['maxBounds'];
  /** Enables resisted, spring-backed panning when `maxBounds` is set. */
  rubberBand?: boolean;
};

type OrthographicStateInternal = {
  startPanPosition?: number[];
  startZoomPosition?: number[];
  startZoom?: number[];
};

function normalizeZoom({
  zoom = 0,
  zoomX,
  zoomY
}: {
  zoom?: number | number[];
  zoomX?: number;
  zoomY?: number;
}): {
  zoomX: number;
  zoomY: number;
} {
  zoomX = zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
  zoomY = zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
  return {zoomX, zoomY};
}

export class OrthographicState extends ViewState<
  OrthographicState,
  OrthographicStateProps,
  OrthographicStateInternal
> {
  constructor(
    options: OrthographicStateProps &
      OrthographicStateInternal & {
        maxZoom?: number;
        minZoom?: number;
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  ) {
    const {
      /* Viewport arguments */
      width, // Width of viewport
      height, // Height of viewport
      target = [0, 0, 0],
      zoom = 0,
      zoomAxis = 'all',

      /* Viewport constraints */
      minZoom = -Infinity,
      maxZoom = Infinity,
      minZoomX = minZoom,
      maxZoomX = maxZoom,
      minZoomY = minZoom,
      maxZoomY = maxZoom,

      maxBounds = null,
      rubberBand = false,

      /** Interaction states, required to calculate change during transform */
      // Model state when the pan operation first started
      startPanPosition,
      // Model state when the zoom operation first started
      startZoomPosition,
      startZoom
    } = options;

    const {zoomX, zoomY} = normalizeZoom(options);

    super(
      {
        width,
        height,
        target,
        zoom,
        zoomX,
        zoomY,
        zoomAxis,
        minZoomX,
        maxZoomX,
        minZoomY,
        maxZoomY,
        maxBounds,
        rubberBand
      },
      {
        startPanPosition,
        startZoomPosition,
        startZoom
      },
      options.makeViewport
    );
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}: {pos: [number, number]}): OrthographicState {
    return this._getUpdatedState({
      startPanPosition: this._unproject(pos)
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPosition}: {pos: [number, number]; startPosition?: number[]}): OrthographicState {
    const startPanPosition = this.getState().startPanPosition || startPosition;

    if (!startPanPosition) {
      return this;
    }

    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(startPanPosition, pos);
    const {maxBounds, rubberBand, width, height, zoomX, zoomY} = this.getViewportProps();

    if (rubberBand && maxBounds && this.getState().startPanPosition) {
      const halfWidth = width / 2 / 2 ** zoomX;
      const halfHeight = height / 2 / 2 ** zoomY;
      newProps.target = newProps.target.slice();

      for (const [index, halfSize] of [halfWidth, halfHeight].entries()) {
        const minimum = maxBounds[0][index] + halfSize;
        const maximum = maxBounds[1][index] - halfSize;
        if (!Number.isFinite(halfSize) || minimum > maximum) {
          newProps.target[index] = (maxBounds[0][index] + maxBounds[1][index]) / 2;
          continue;
        }
        const constrained = clamp(newProps.target[index], minimum, maximum);
        const overshoot = newProps.target[index] - constrained;
        if (overshoot) {
          newProps.target[index] =
            constrained + (overshoot * halfSize) / (halfSize + Math.abs(overshoot));
        }
      }

      RUBBER_BAND_TARGETS.add(newProps.target);
    }

    return this._getUpdatedState(newProps);
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): OrthographicState {
    const {target} = this.getViewportProps();
    return this._getUpdatedState({
      startPanPosition: null,
      ...(RUBBER_BAND_TARGETS.has(target) && {target: target.slice()})
    });
  }

  /**
   * Start rotating
   */
  rotateStart(): OrthographicState {
    return this;
  }

  /**
   * Rotate
   */
  rotate(): OrthographicState {
    return this;
  }

  /**
   * End rotating
   */
  rotateEnd(): OrthographicState {
    return this;
  }

  // shortest path between two view states
  shortestPathFrom(viewState: OrthographicState): OrthographicStateProps {
    const fromProps = viewState.getViewportProps();
    const props = {...this.getViewportProps()};
    return props;
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}: {pos: [number, number]}): OrthographicState {
    const {zoomX, zoomY} = this.getViewportProps();
    return this._getUpdatedState({
      startZoomPosition: this._unproject(pos),
      startZoom: [zoomX, zoomY]
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
  }): OrthographicState {
    let {startZoom, startZoomPosition} = this.getState();
    if (!startZoomPosition) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      const {zoomX, zoomY} = this.getViewportProps();
      startZoom = [zoomX, zoomY];
      startZoomPosition = this._unproject(startPos || pos);
    }
    if (!startZoomPosition) {
      return this;
    }
    const newZoomProps = this._constrainZoom(this._calculateNewZoom({scale, startZoom}));
    const zoomedViewport = this.makeViewport({...this.getViewportProps(), ...newZoomProps});

    return this._getUpdatedState({
      ...newZoomProps,
      ...zoomedViewport.panByPosition(startZoomPosition, pos)
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): OrthographicState {
    return this._getUpdatedState({
      startZoomPosition: null,
      startZoom: null
    });
  }

  zoomIn(speed: number = 2): OrthographicState {
    return this._getUpdatedState(this._calculateNewZoom({scale: speed}));
  }

  zoomOut(speed: number = 2): OrthographicState {
    return this._getUpdatedState(this._calculateNewZoom({scale: 1 / speed}));
  }

  moveLeft(speed: number = 50): OrthographicState {
    return this._panFromCenter([-speed, 0]);
  }

  moveRight(speed: number = 50): OrthographicState {
    return this._panFromCenter([speed, 0]);
  }

  moveUp(speed: number = 50): OrthographicState {
    return this._panFromCenter([0, -speed]);
  }

  moveDown(speed: number = 50): OrthographicState {
    return this._panFromCenter([0, speed]);
  }

  rotateLeft(speed: number = 15): OrthographicState {
    return this;
  }

  rotateRight(speed: number = 15): OrthographicState {
    return this;
  }

  rotateUp(speed: number = 10): OrthographicState {
    return this;
  }

  rotateDown(speed: number = 10): OrthographicState {
    return this;
  }

  /* Private methods */

  _project(pos: number[]): number[] {
    const viewport = this.makeViewport(this.getViewportProps());
    return viewport.project(pos);
  }
  _unproject(pos: number[]): number[] {
    const viewport = this.makeViewport(this.getViewportProps());
    return viewport.unproject(pos);
  }

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}: {scale: number; startZoom?: number[]}): {
    zoomX: number;
    zoomY: number;
  } {
    const {zoomX, zoomY, zoomAxis} = this.getViewportProps();
    if (startZoom === undefined) {
      startZoom = [zoomX, zoomY];
    }
    const deltaZoom = Math.log2(scale);
    let [newZoomX, newZoomY] = startZoom;
    switch (zoomAxis) {
      case 'X':
        // Scale x only
        newZoomX += deltaZoom;
        break;
      case 'Y':
        // Scale y only
        newZoomY += deltaZoom;
        break;
      default:
        // Lock aspect ratio
        newZoomX += deltaZoom;
        newZoomY += deltaZoom;
    }
    return {
      zoomX: newZoomX,
      zoomY: newZoomY
    };
  }

  _panFromCenter(offset) {
    const {target} = this.getViewportProps();
    const center = this._project(target);
    return this.pan({
      startPosition: target,
      pos: [center[0] + offset[0], center[1] + offset[1]]
    });
  }

  _getUpdatedState(newProps): OrthographicState {
    // @ts-ignore
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<OrthographicStateProps>): Required<OrthographicStateProps> {
    // Ensure zoom is within specified range
    const {zoomX, zoomY} = this._constrainZoom(props, props);
    props.zoomX = zoomX;
    props.zoomY = zoomY;
    // Backward compatibility: update zoom to reflect new view state
    // zoom will always be ignored when zoomX and zoomY are specified, but legacy apps may still read zoom in `onViewStateChange`
    props.zoom =
      Array.isArray(props.zoom) || props.zoomX !== props.zoomY
        ? [props.zoomX, props.zoomY]
        : props.zoomX;

    const {maxBounds, target} = props;
    if (maxBounds) {
      // only calculate center and zoom ranges at rotation=0
      // to maintain visual stability when rotating
      const halfWidth = props.width / 2 / 2 ** zoomX;
      const halfHeight = props.height / 2 / 2 ** zoomY;
      const minX = maxBounds[0][0] + halfWidth;
      const maxX = maxBounds[1][0] - halfWidth;
      const minY = maxBounds[0][1] + halfHeight;
      const maxY = maxBounds[1][1] - halfHeight;
      const preserveRubberBandTarget = Boolean(props.rubberBand && RUBBER_BAND_TARGETS.has(target));
      const x =
        minX > maxX && props.rubberBand
          ? (maxBounds[0][0] + maxBounds[1][0]) / 2
          : preserveRubberBandTarget
            ? target[0]
            : clamp(target[0], minX, maxX);
      const y =
        minY > maxY && props.rubberBand
          ? (maxBounds[0][1] + maxBounds[1][1]) / 2
          : preserveRubberBandTarget
            ? target[1]
            : clamp(target[1], minY, maxY);
      if (x !== target[0] || y !== target[1]) {
        props.target = target.slice();
        props.target[0] = x;
        props.target[1] = y;
        if (preserveRubberBandTarget && (minX <= maxX || minY <= maxY)) {
          RUBBER_BAND_TARGETS.add(props.target);
        }
      }
    }
    return props;
  }

  _constrainZoom(
    {zoomX, zoomY}: {zoomX: number; zoomY: number},
    props?: Required<OrthographicStateProps>
  ): {zoomX: number; zoomY: number} {
    props ||= this.getViewportProps();
    const {zoomAxis, maxZoomX, maxZoomY, maxBounds} = props;
    let {minZoomX, minZoomY} = props;
    const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;

    if (shouldApplyMaxBounds) {
      const bl = maxBounds[0];
      const tr = maxBounds[1];
      const w = tr[0] - bl[0];
      const h = tr[1] - bl[1];
      // ignore bound size of 0 or Infinity
      if (Number.isFinite(w) && w > 0) {
        minZoomX = Math.max(minZoomX, Math.log2(props.width / w));
        if (minZoomX > maxZoomX) minZoomX = maxZoomX;
      }
      if (Number.isFinite(h) && h > 0) {
        minZoomY = Math.max(minZoomY, Math.log2(props.height / h));
        if (minZoomY > maxZoomY) minZoomY = maxZoomY;
      }
    }

    switch (zoomAxis) {
      case 'X':
        zoomX = clamp(zoomX, minZoomX, maxZoomX);
        break;
      case 'Y':
        zoomY = clamp(zoomY, minZoomY, maxZoomY);
        break;
      default:
        // Lock aspect ratio
        let delta = Math.min(maxZoomX - zoomX, maxZoomY - zoomY, 0);
        if (delta === 0) {
          delta = Math.max(minZoomX - zoomX, minZoomY - zoomY, 0);
        }
        if (delta !== 0) {
          zoomX += delta;
          zoomY += delta;
        }
    }
    return {zoomX, zoomY};
  }
}

export default class OrthographicController extends Controller<OrthographicState> {
  ControllerState = OrthographicState;
  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator(['target', 'zoomX', 'zoomY'])
  };
  dragMode: 'pan' | 'rotate' = 'pan';

  setProps(props: ControllerProps & OrthographicStateProps) {
    Object.assign(props, normalizeZoom(props));
    super.setProps(props);
  }

  protected override _onPanStart(event: MjolnirGestureEvent): boolean {
    const handled = super._onPanStart(event);
    if (handled) {
      this._cancelRubberBandTransition();
    }
    return handled;
  }

  protected override _onPanMoveEnd(event: MjolnirGestureEvent): boolean {
    if (!this.props.rubberBand || !this.props.maxBounds || !this.dragPan) {
      return super._onPanMoveEnd(event);
    }

    const duration = this.inertia || this.transition.transitionDuration;
    let overshotState = this.controllerState;

    if (event.velocity) {
      const position = this.getCenter(event);
      overshotState = overshotState.pan({
        pos: [
          position[0] + (event.velocityX * duration) / 2,
          position[1] + (event.velocityY * duration) / 2
        ]
      });
    }

    const constrainedState = overshotState.panEnd();
    const overshotTarget = overshotState.getViewportProps().target;
    const constrainedTarget = constrainedState.getViewportProps().target;

    if (overshotTarget[0] === constrainedTarget[0] && overshotTarget[1] === constrainedTarget[1]) {
      const currentState = this.controllerState;
      const currentTarget = currentState.getViewportProps().target;
      const currentConstrainedTarget = currentState.panEnd().getViewportProps().target;
      if (
        currentTarget[0] === currentConstrainedTarget[0] &&
        currentTarget[1] === currentConstrainedTarget[1]
      ) {
        return super._onPanMoveEnd(event);
      }
    }

    this.updateViewport(
      constrainedState,
      {
        ...this._getTransitionProps(),
        transitionDuration: duration,
        transitionInterpolator: new RubberBandInterpolator(overshotTarget)
      },
      {isDragging: false, isPanning: true}
    );
    return true;
  }

  protected _onMultiPanStart(event: MjolnirGestureEvent): boolean {
    const handled = this.multiTouchDrag === 'pan' && super._onMultiPanStart(event);
    if (handled) {
      this._cancelRubberBandTransition();
    }
    return handled;
  }

  private _cancelRubberBandTransition(): void {
    if (this.props.rubberBand && this.props.maxBounds) {
      this.transitionManager.transition.cancel();
    }
  }

  _onPanRotate() {
    // No rotation in orthographic view
    return false;
  }
}
