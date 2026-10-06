// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import ViewState from './view-state';
import {getMaxBoundsRect} from './utils';
import {pixelsToWorld, worldToPixels} from '@math.gl/web-mercator';
import {mod} from '../utils/math-utils';

import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';

const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;

/** Camera and constraint properties for a custom planar projection. */
export type CustomProjectionStateProps = {
  width: number;
  height: number;
  /** Camera center in fromCrs world coordinates. */
  center?: [number, number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;

  /** Viewport constraints */
  maxZoom?: number;
  minZoom?: number;
  minPitch?: number;
  maxPitch?: number;

  /** Optional world-coordinate bounds in fromCrs. Defaults to null (unrestricted). */
  maxBounds?: ControllerProps['maxBounds'];
  maxBoundsPadding?: ControllerProps['maxBoundsPadding'];
};

type CustomProjectionStateInternal = {
  startPanPosition?: number[];
  startRotatePos?: [number, number];
  startPitch?: number;
  startBearing?: number;
  startZoomPosition?: number[];
  startZoom?: number;
};

/** Planar navigation with common-space anchors and world-coordinate bounds. */
export class CustomProjectionState extends ViewState<
  CustomProjectionState,
  CustomProjectionStateProps,
  CustomProjectionStateInternal
> {
  constructor(
    options: CustomProjectionStateProps &
      CustomProjectionStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  ) {
    const {
      /* Viewport arguments */
      width, // Width of viewport
      height, // Height of viewport
      pitch = 0, // Map pitch in degrees
      bearing = 0, // Map bearing in degrees
      center = [0, 0, 0],
      zoom = 0,

      /* Viewport constraints */
      minPitch = 0,
      maxPitch = 85,
      minZoom = -Infinity,
      maxZoom = Infinity,

      maxBounds = null,
      maxBoundsPadding = null,

      /** Interaction states, required to calculate change during transform */
      // Model state when the pan operation first started
      startPanPosition,
      // Model state when the rotate operation first started
      startRotatePos,
      startPitch,
      startBearing,
      // Model state when the zoom operation first started
      startZoomPosition,
      startZoom
    } = options;

    super(
      {
        width,
        height,
        pitch,
        bearing,
        center,
        zoom,
        minPitch,
        maxPitch,
        minZoom,
        maxZoom,
        maxBounds,
        maxBoundsPadding
      },
      {
        startPanPosition,
        startRotatePos,
        startPitch,
        startBearing,
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
  panStart({pos}: {pos: [number, number]}): CustomProjectionState {
    return this._getUpdatedState({
      startPanPosition: this._unproject(pos)
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({
    pos,
    startPos
  }: {
    pos: [number, number];
    startPos?: [number, number];
  }): CustomProjectionState {
    const startPanPosition = this.getState().startPanPosition || this._unproject(startPos);

    if (!startPanPosition) {
      return this;
    }

    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = this._panByPosition(viewport, startPanPosition, pos);

    return this._getUpdatedState(newProps);
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): CustomProjectionState {
    return this._getUpdatedState({
      startPanPosition: undefined
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}: {pos: [number, number]}): CustomProjectionState {
    return this._getUpdatedState({
      startRotatePos: pos,
      startPitch: this.getViewportProps().pitch,
      startBearing: this.getViewportProps().bearing
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
  }): CustomProjectionState {
    const {startRotatePos, startPitch, startBearing} = this.getState();
    if (!startRotatePos || startPitch === undefined || startBearing === undefined) {
      return this;
    }

    let newRotation;
    if (pos) {
      newRotation = this._getNewRotation(pos, startRotatePos, startPitch, startBearing);
    } else {
      newRotation = {
        pitch: startPitch + deltaAngleY,
        bearing: startBearing + deltaAngleX
      };
    }

    return this._getUpdatedState(newRotation);
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd(): CustomProjectionState {
    return this._getUpdatedState({
      startRotatePos: undefined,
      startPitch: undefined,
      startBearing: undefined
    });
  }

  // shortest path between two view states
  shortestPathFrom(viewState: CustomProjectionState): CustomProjectionStateProps {
    const fromProps = viewState.getViewportProps();
    const props = {...this.getViewportProps()};
    const {bearing} = props;

    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }

    return props;
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}: {pos: [number, number]}): CustomProjectionState {
    return this._getUpdatedState({
      startZoomPosition: this._unproject(pos),
      startZoom: this.getViewportProps().zoom
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
  zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): CustomProjectionState {
    let {startZoom, startZoomPosition} = this.getState();
    if (!startZoomPosition) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = this.getViewportProps().zoom;
      startZoomPosition = this._unproject(startPos || pos);
    }
    if (!startZoomPosition) {
      return this;
    }
    const newZoom = this._calculateNewZoom({scale, startZoom});
    const zoomedViewport = this.makeViewport({...this.getViewportProps(), zoom: newZoom});

    return this._getUpdatedState({
      zoom: newZoom,
      ...this._panByPosition(zoomedViewport, startZoomPosition, pos)
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): CustomProjectionState {
    return this._getUpdatedState({
      startZoomPosition: undefined,
      startZoom: undefined
    });
  }

  zoomIn(speed: number = 2): CustomProjectionState {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({scale: speed})
    });
  }

  zoomOut(speed: number = 2): CustomProjectionState {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({scale: 1 / speed})
    });
  }

  moveLeft(speed: number = 100): CustomProjectionState {
    return this._panFromCenter([speed, 0]);
  }

  moveRight(speed: number = 100): CustomProjectionState {
    return this._panFromCenter([-speed, 0]);
  }

  moveUp(speed: number = 100): CustomProjectionState {
    return this._panFromCenter([0, speed]);
  }

  moveDown(speed: number = 100): CustomProjectionState {
    return this._panFromCenter([0, -speed]);
  }

  rotateLeft(speed: number = 15): CustomProjectionState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing - speed
    });
  }

  rotateRight(speed: number = 15): CustomProjectionState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing + speed
    });
  }

  rotateUp(speed: number = 10): CustomProjectionState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch + speed
    });
  }

  rotateDown(speed: number = 10): CustomProjectionState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch - speed
    });
  }

  /* Private methods */

  _unproject(pos?: [number, number]): number[] | undefined {
    if (!pos) return undefined;
    // Navigation anchors stay on the common-space ground plane, regardless of picked geometry.
    const viewport = this.makeViewport(this.getViewportProps());
    const position = pixelsToWorld(pos, viewport.pixelUnprojectionMatrix, 0);
    return position.every(Number.isFinite) ? position : undefined;
  }

  private _panByPosition(
    viewport: Viewport,
    position: number[],
    pixel: number[]
  ): {center: [number, number, number]} {
    const underPointer = pixelsToWorld(pixel, viewport.pixelUnprojectionMatrix, 0);
    const center = viewport.unprojectPosition([
      viewport.center[0] + position[0] - underPointer[0],
      viewport.center[1] + position[1] - underPointer[1],
      0
    ]);
    return {
      center: center.every(Number.isFinite)
        ? [center[0], center[1], 0]
        : this.getViewportProps().center
    };
  }

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}: {scale: number; startZoom?: number}): number {
    if (startZoom === undefined) {
      startZoom = this.getViewportProps().zoom;
    }
    const zoom = (startZoom as number) + Math.log2(scale);
    return this._constrainZoom(zoom);
  }

  _panFromCenter(offset: [number, number]): CustomProjectionState {
    const {width, height} = this.getViewportProps();
    return this.pan({
      startPos: [width / 2, height / 2],
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }

  _getUpdatedState(
    newProps: Partial<CustomProjectionStateProps & CustomProjectionStateInternal>
  ): CustomProjectionState {
    return new CustomProjectionState({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }

  /** Constrain the planar camera without wrapping its common-space center. */
  applyConstraints(
    props: Required<CustomProjectionStateProps>
  ): Required<CustomProjectionStateProps> {
    props.minPitch = clamp(props.minPitch, 0, 85);
    props.maxPitch = clamp(props.maxPitch, props.minPitch, 85);
    props.pitch = clamp(props.pitch, props.minPitch, props.maxPitch);
    props.bearing = mod(props.bearing + 180, 360) - 180;
    const maxBounds = this._projectMaxBounds(props);
    props.zoom = this._constrainZoom(props.zoom, props, maxBounds);
    props.center = [props.center[0], props.center[1], 0];
    if (maxBounds) {
      // Fit and constrain in the unrotated ground plane so rotating does not move the map.
      const rect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
      const viewport = this.makeViewport({...props, pitch: 0, bearing: 0});
      const commonCenter = viewport.center.slice();
      const [x, y] = worldToPixels(commonCenter, viewport.pixelProjectionMatrix);
      const extents = {
        left: x - rect.x,
        right: rect.x + rect.width - x,
        top: y - rect.y,
        bottom: rect.y + rect.height - y
      };
      const scale = 2 ** props.zoom;
      if (rect.width >= 0) {
        commonCenter[0] = clamp(
          commonCenter[0],
          maxBounds[0][0] + extents.left / scale,
          maxBounds[1][0] - extents.right / scale
        );
      }
      if (rect.height >= 0) {
        commonCenter[1] = clamp(
          commonCenter[1],
          maxBounds[0][1] + extents.bottom / scale,
          maxBounds[1][1] - extents.top / scale
        );
      }
      if (commonCenter[0] !== viewport.center[0] || commonCenter[1] !== viewport.center[1]) {
        const worldCenter = viewport.unprojectPosition(commonCenter);
        if (worldCenter.every(Number.isFinite)) props.center = [worldCenter[0], worldCenter[1], 0];
      }
    }
    return props;
  }

  _constrainZoom(
    zoom: number,
    props = this.getViewportProps(),
    maxBounds = this._projectMaxBounds(props)
  ): number {
    const {maxZoom} = props;
    let {minZoom} = props;
    if (maxBounds && props.width > 0 && props.height > 0) {
      const rect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
      const width = maxBounds[1][0] - maxBounds[0][0];
      const height = maxBounds[1][1] - maxBounds[0][1];
      if (rect.width > 0 && Number.isFinite(width) && width > 0) {
        minZoom = Math.max(minZoom, Math.log2(rect.width / width));
      }
      if (rect.height > 0 && Number.isFinite(height) && height > 0) {
        minZoom = Math.max(minZoom, Math.log2(rect.height / height));
      }
      minZoom = Math.min(minZoom, maxZoom);
    }
    return clamp(zoom, minZoom, maxZoom);
  }

  /** Approximate the projected envelope, including curved edges between corners. */
  private _projectMaxBounds(
    props: Required<CustomProjectionStateProps>
  ): [[number, number], [number, number]] | null {
    if (!props.maxBounds) return null;
    const viewport = this.makeViewport(props);
    const [[minX, minY], [maxX, maxY]] = props.maxBounds;
    const bounds: [[number, number], [number, number]] = [
      [Infinity, Infinity],
      [-Infinity, -Infinity]
    ];
    const subdivisions = 32;
    for (let i = 0; i <= subdivisions; i++) {
      const x = minX + ((maxX - minX) * i) / subdivisions;
      const y = minY + ((maxY - minY) * i) / subdivisions;
      for (const point of [
        [x, minY, 0],
        [x, maxY, 0],
        [minX, y, 0],
        [maxX, y, 0]
      ]) {
        const position = viewport.projectPosition(point);
        if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) continue;
        for (let axis = 0; axis < 2; axis++) {
          bounds[0][axis] = Math.min(bounds[0][axis], position[axis]);
          bounds[1][axis] = Math.max(bounds[1][axis], position[axis]);
        }
      }
    }
    return Number.isFinite(bounds[0][0]) ? bounds : null;
  }
  _getNewRotation(
    pos: [number, number],
    startPos: [number, number],
    startPitch: number,
    startBearing: number
  ): {
    pitch: number;
    bearing: number;
  } {
    const deltaX = pos[0] - startPos[0];
    const deltaY = pos[1] - startPos[1];
    const centerY = pos[1];
    const startY = startPos[1];
    const {width, height} = this.getViewportProps();

    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;

    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        // Dragging down flattens the map, matching MapController.
        deltaScaleY = (deltaY / (startY - height)) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        deltaScaleY = 1 - centerY / startY;
      }
    }
    // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
    // deltaScaleX does not need to be clamped as bearing does not have constraints.
    deltaScaleY = clamp(deltaScaleY, -1, 1);

    const {minPitch, maxPitch} = this.getViewportProps();

    const bearing = startBearing + 180 * deltaScaleX;
    let pitch = startPitch;
    if (deltaScaleY > 0) {
      // Gradually increase pitch
      pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
    } else if (deltaScaleY < 0) {
      // Gradually decrease pitch
      pitch = startPitch - deltaScaleY * (minPitch - startPitch);
    }

    return {
      pitch,
      bearing
    };
  }
}

/** Map-like gestures with navigation anchored in common space on z=0.
 * @experimental Exported as `_CustomProjectionController`; this API may change.
 */
export default class CustomProjectionController extends Controller<CustomProjectionState> {
  ControllerState = CustomProjectionState;
  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator(['center', 'zoom', 'pitch', 'bearing'])
  };

  dragMode: 'pan' | 'rotate' = 'pan';
}
