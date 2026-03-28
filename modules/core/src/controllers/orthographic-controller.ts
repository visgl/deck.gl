// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import ViewState from './view-state';

import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';

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
        maxBounds
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

    return this._getUpdatedState(newProps);
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): OrthographicState {
    return this._getUpdatedState({
      startPanPosition: null
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
      const x = clamp(target[0], minX, maxX);
      const y = clamp(target[1], minY, maxY);
      if (x !== target[0] || y !== target[1]) {
        props.target = target.slice();
        props.target[0] = x;
        props.target[1] = y;
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

  _onPanRotate() {
    // No rotation in orthographic view
    return false;
  }
}
