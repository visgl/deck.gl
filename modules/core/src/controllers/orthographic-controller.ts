// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps, type InteractionState} from './controller';
import ViewState from './view-state';

import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';
import type {TransitionProps} from './transition-manager';
import type {MjolnirGestureEvent} from 'mjolnir.js';

/** Marks temporary gesture and transition props without exposing them in view state. */
const MAX_BOUNDS_RUBBER_BAND_PHASE = Symbol('maxBoundsRubberBandPhase');
/** Keeps edge rebounds responsive without shortening configured fling inertia. */
const MAX_BOUNDS_RUBBER_BAND_DURATION = 300;

type MaxBoundsRubberBandPhase = {
  [MAX_BOUNDS_RUBBER_BAND_PHASE]?: 'drag' | 'transition';
};

/** Preserves temporary overscroll during a direct, monotonic return to the content bounds. */
class RubberBandInterpolator extends LinearInterpolator {
  constructor() {
    super(['target', 'zoomX', 'zoomY']);
  }

  /** Keeps elastic edge returns short without changing ordinary fling inertia. */
  override getDuration(startProps: Record<string, any>, endProps: Record<string, any>): number {
    return isTargetOverscrolled(startProps)
      ? MAX_BOUNDS_RUBBER_BAND_DURATION
      : super.getDuration(startProps, endProps);
  }

  /** Allows a zero-duration gesture to interrupt an in-progress return. */
  override arePropsEqual(
    currentProps: Record<string, any>,
    nextProps: Record<string, any>
  ): boolean {
    return (
      !(currentProps.transitionDuration === 0 && isTargetOverscrolled(currentProps)) &&
      super.arePropsEqual(currentProps, nextProps)
    );
  }

  /** Carries rebound identity only inside the transition manager. */
  override initializeProps(startProps: Record<string, any>, endProps: Record<string, any>) {
    const props = super.initializeProps(startProps, endProps) as {
      start: Record<string, any> & MaxBoundsRubberBandPhase;
      end: Record<string, any>;
    };
    if (isTargetOverscrolled(startProps)) {
      props.start[MAX_BOUNDS_RUBBER_BAND_PHASE] = 'transition';
    }
    return props;
  }

  /** Preserves temporary overshoot until the final, bounded transition frame. */
  override interpolateProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>,
    t: number
  ): Record<string, any> {
    const props = super.interpolateProps(startProps, endProps, t) as Record<string, any> &
      MaxBoundsRubberBandPhase;
    const phase = (startProps as Record<string, any> & MaxBoundsRubberBandPhase)[
      MAX_BOUNDS_RUBBER_BAND_PHASE
    ];
    if (phase === 'transition' && t < 1) {
      props[MAX_BOUNDS_RUBBER_BAND_PHASE] = 'transition';
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
  /** Enables spring-backed panning only with `maxBounds`. Defaults to `false`. */
  maxBoundsRubberBand?: boolean;
};

type OrthographicStateInternal = {
  startPanPosition?: number[];
  startZoomPosition?: number[];
  startZoom?: number[];
  /** Preserves the release target before native inertia projects another pan. */
  previousPanTarget?: number[];
  /** Identifies a state-owned rebound while a controlled view reconstructs it. */
  isMaxBoundsRubberBandTransition?: boolean;
  /** Keeps panning active while the state-defined edge return is running. */
  transitionInteractionState?: InteractionState;
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

function getAxisBounds(
  maxBounds: NonNullable<ControllerProps['maxBounds']>,
  index: number,
  halfSize: number,
  target: number
) {
  const minimum = maxBounds[0][index] + halfSize;
  const maximum = maxBounds[1][index] - halfSize;
  const midpoint = (maxBounds[0][index] + maxBounds[1][index]) / 2;
  return {
    minimum,
    maximum,
    midpoint,
    settledTarget:
      Number.isFinite(halfSize) && minimum <= maximum ? clamp(target, minimum, maximum) : midpoint
  };
}

/** Tests each axis against the position where it would settle after release. */
function isTargetOverscrolled(props: Record<string, any>): boolean {
  const {maxBounds, maxBoundsRubberBand, target, width, height} = props;
  if (!maxBoundsRubberBand || !maxBounds || !target) {
    return false;
  }
  const {zoomX, zoomY} = normalizeZoom(props);
  return [width / 2 / 2 ** zoomX, height / 2 / 2 ** zoomY].some((halfSize, index) => {
    const {settledTarget} = getAxisBounds(maxBounds, index, halfSize, target[index]);
    return target[index] !== settledTarget;
  });
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
      maxBoundsRubberBand = false,

      /** Interaction states, required to calculate change during transform */
      // Model state when the pan operation first started
      startPanPosition,
      // Model state when the zoom operation first started
      startZoomPosition,
      startZoom,
      previousPanTarget,
      isMaxBoundsRubberBandTransition,
      transitionInteractionState
    } = options;

    const {[MAX_BOUNDS_RUBBER_BAND_PHASE]: maxBoundsRubberBandPhase} =
      options as OrthographicStateProps & MaxBoundsRubberBandPhase;
    // Let inherited, remappable actions interrupt a spring without snapping to its edge.
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
        maxBoundsRubberBand,
        ...{
          [MAX_BOUNDS_RUBBER_BAND_PHASE]:
            maxBoundsRubberBandPhase ??
            (startPanPosition || isMaxBoundsRubberBandTransition ? 'transition' : undefined)
        }
      },
      {
        startPanPosition,
        startZoomPosition,
        startZoom,
        previousPanTarget,
        isMaxBoundsRubberBandTransition,
        transitionInteractionState
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

    return this._getUpdatedState({
      ...newProps,
      previousPanTarget: this.getViewportProps().target
    });
  }

  /**
   * Ends a semantic pan and supplies a spring-back when it exceeds `maxBounds`.
   * Must be called if `panStart()` was called.
   */
  panEnd(): OrthographicState {
    const {maxBounds, maxBoundsRubberBand, target} = this.getViewportProps();
    const previousPanTarget = this.getState().previousPanTarget;
    let endedState = this._getUpdatedState({
      startPanPosition: null,
      previousPanTarget: null
    });
    let isOverscrolled = target.some(
      (value, index) => value !== endedState.getViewportProps().target[index]
    );

    // Settle from the real release target, not a later inertia-projected position.
    if (maxBoundsRubberBand && maxBounds && previousPanTarget) {
      const previousEndedState = this._getUpdatedState({
        target: previousPanTarget,
        startPanPosition: null,
        previousPanTarget: null
      });
      const wasOverscrolled = previousPanTarget.some(
        (value, index) => value !== previousEndedState.getViewportProps().target[index]
      );
      if (wasOverscrolled) {
        isOverscrolled = true;
        endedState = previousEndedState;
      }
    }

    if (maxBoundsRubberBand && maxBounds && isOverscrolled) {
      endedState = endedState._getUpdatedState({
        isMaxBoundsRubberBandTransition: true,
        transitionInteractionState: {isPanning: true}
      });
      Object.assign(endedState.getViewportProps(), {
        transitionDuration: MAX_BOUNDS_RUBBER_BAND_DURATION,
        transitionInterpolator: new RubberBandInterpolator(),
        transitionEasing: (time: number) => 1 - (1 - time) * (1 - time)
      } satisfies TransitionProps);
    }

    return endedState;
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
      ...newProps,
      // A semantic action consumes the active rebound identity. panEnd sets it again when needed.
      isMaxBoundsRubberBandTransition: newProps.isMaxBoundsRubberBandTransition,
      [MAX_BOUNDS_RUBBER_BAND_PHASE]:
        this.getState().startPanPosition && newProps.startPanPosition !== null && newProps.target
          ? 'drag'
          : undefined
    });
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<OrthographicStateProps>): Required<OrthographicStateProps> {
    const internalProps = props as typeof props & MaxBoundsRubberBandPhase;
    const maxBoundsRubberBandPhase = internalProps[MAX_BOUNDS_RUBBER_BAND_PHASE];
    delete internalProps[MAX_BOUNDS_RUBBER_BAND_PHASE];

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

    const {maxBounds, maxBoundsRubberBand, target} = props;
    if (maxBounds) {
      // only calculate center and zoom ranges at rotation=0
      // to maintain visual stability when rotating
      const halfWidth = props.width / 2 / 2 ** zoomX;
      const halfHeight = props.height / 2 / 2 ** zoomY;
      const constrainedTarget = target.slice();

      for (const [index, halfSize] of [halfWidth, halfHeight].entries()) {
        const {minimum, maximum, midpoint, settledTarget} = getAxisBounds(
          maxBounds,
          index,
          halfSize,
          target[index]
        );

        if (maxBoundsRubberBand && !Number.isFinite(halfSize)) {
          constrainedTarget[index] = midpoint;
          continue;
        }

        const constrained = maxBoundsRubberBand
          ? settledTarget
          : clamp(target[index], minimum, maximum);
        const overshoot = target[index] - constrained;
        constrainedTarget[index] =
          maxBoundsRubberBand && maxBoundsRubberBandPhase === 'transition'
            ? target[index]
            : maxBoundsRubberBand && maxBoundsRubberBandPhase === 'drag' && overshoot
              ? constrained + (overshoot * halfSize) / (halfSize + Math.abs(overshoot))
              : constrained;
      }

      if (constrainedTarget[0] !== target[0] || constrainedTarget[1] !== target[1]) {
        props.target = constrainedTarget;
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

  protected _onMultiPanStart(event: MjolnirGestureEvent): boolean {
    return this.multiTouchDrag === 'pan' && super._onMultiPanStart(event);
  }

  _onPanRotate() {
    // No rotation in orthographic view
    return false;
  }
}
