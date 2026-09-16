// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import {MAX_LATITUDE} from '@math.gl/web-mercator';
import Controller, {type ControllerProps} from './controller';
import {getMaxBoundsExtents, getMaxBoundsRect} from './utils';

import {MapState, MapStateProps} from './map-controller';
import type {MapStateInternal} from './map-controller';
import {CONSTRAINT_AROUND, type ConstraintAround} from './view-state';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';
import GlobeViewport, {zoomAdjust, GLOBE_RADIUS} from '../viewports/globe-viewport';
import {
  Globe,
  type CameraFrame,
  GLOBE_INERTIA_EASING,
  GlobeInertiaInterpolator
} from '../viewports/globe-utils';

import type {MjolnirGestureEvent} from 'mjolnir.js';

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

function degreesToPixels(angle: number, zoom: number = 0): number {
  const radians = Math.min(180, angle) * DEGREES_TO_RADIANS;
  const size = GLOBE_RADIUS * 2 * Math.sin(radians / 2);
  return size * Math.pow(2, zoom);
}

function pixelsToDegrees(pixels: number, zoom: number = 0): number {
  const size = pixels / Math.pow(2, zoom);
  const radians = Math.asin(Math.min(1, size / GLOBE_RADIUS / 2)) * 2;
  return radians * RADIANS_TO_DEGREES;
}

type GlobeStateInternal = MapStateInternal & {
  startPanPos?: [number, number];
  startPanCameraFrame?: CameraFrame;
  startPanAngularRate?: number;
};

class GlobeState extends MapState {
  constructor(
    options: MapStateProps &
      GlobeStateInternal & {
        makeViewport: (props: Record<string, any>) => any;
      }
  ) {
    const {startPanPos, startPanCameraFrame, startPanAngularRate, ...mapStateOptions} = options;
    mapStateOptions.normalize = false;
    super(mapStateOptions);

    const s = (this as any)._state;
    if (startPanPos !== undefined) s.startPanPos = startPanPos;
    if (startPanCameraFrame !== undefined) s.startPanCameraFrame = startPanCameraFrame;
    if (startPanAngularRate !== undefined) s.startPanAngularRate = startPanAngularRate;
  }

  panStart({pos}: {pos: [number, number]}): GlobeState {
    const {latitude, longitude, zoom, bearing = 0} = this.getViewportProps();
    const cameraFrame = Globe.cameraFrame(longitude, latitude, bearing);
    if (this.getViewportProps().navigation === 'map') {
      // Use geographic axes for locked navigation, including deliberately rotated maps.
      cameraFrame.axisHorizontal = [0, 0, 1];
      cameraFrame.axisVertical = Globe.cameraFrame(longitude, latitude, 0).axisVertical;
    }

    // Radians of arc per pixel, derived from zoom scale
    const scale = Math.pow(2, zoom - zoomAdjust(latitude, true));
    const angularRate = (0.25 / scale) * DEGREES_TO_RADIANS;

    return this._getUpdatedState({
      startPanPos: pos,
      startPanCameraFrame: cameraFrame,
      startPanAngularRate: angularRate,
      startZoom: zoom
    }) as GlobeState;
  }

  pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): GlobeState {
    const state = this.getState() as GlobeStateInternal;
    const startPanPos = state.startPanPos || startPos;
    if (!startPanPos) return this;

    const frame = state.startPanCameraFrame;
    const rate = state.startPanAngularRate;
    const startZoom = state.startZoom ?? this.getViewportProps().zoom;
    if (!frame || !rate) {
      return this;
    }

    const deltaX = startPanPos[0] - pos[0];
    const deltaY = startPanPos[1] - pos[1];
    const lockBearing = this.getViewportProps().navigation === 'map';
    let horizontalAngle = deltaX * rate;
    let verticalAngle = -deltaY * rate;
    if (lockBearing) {
      const bearing = frame.bearing * DEGREES_TO_RADIANS;
      // Resolve screen movement into geographic angles; compensate for smaller latitude circles.
      horizontalAngle =
        ((deltaX * Math.cos(bearing) - deltaY * Math.sin(bearing)) * rate) /
        Math.max(Math.cos(frame.latitude * DEGREES_TO_RADIANS), 0.25);
      verticalAngle = clamp(
        -(deltaX * Math.sin(bearing) + deltaY * Math.cos(bearing)) * rate,
        -(MAX_LATITUDE + frame.latitude) * DEGREES_TO_RADIANS,
        (MAX_LATITUDE - frame.latitude) * DEGREES_TO_RADIANS
      );
    }
    const rotated = Globe.rotateFrame(frame, horizontalAngle, verticalAngle, lockBearing);
    const zoom = startZoom + zoomAdjust(rotated.latitude, true) - zoomAdjust(frame.latitude, true);

    return this._getUpdatedState({
      longitude: rotated.longitude,
      latitude: rotated.latitude,
      bearing: rotated.bearing,
      zoom
    }) as GlobeState;
  }

  panEnd(): GlobeState {
    return this._getUpdatedState({
      startPanPos: null,
      startPanCameraFrame: null,
      startPanAngularRate: null,
      startZoom: null
    }) as GlobeState;
  }

  _panFromCenter(offset: [number, number]): GlobeState {
    const {width, height} = this.getViewportProps();
    const center: [number, number] = [width / 2, height / 2];
    return this.panStart({pos: center})
      .pan({pos: [center[0] + offset[0], center[1] + offset[1]]})
      .panEnd();
  }

  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps> {
    const internalProps = props as typeof props & ConstraintAround;
    const constraintAround = internalProps[CONSTRAINT_AROUND];
    delete internalProps[CONSTRAINT_AROUND];
    const {latitude, maxBounds} = props;

    props.zoom = this._constrainZoom(props.zoom, props);

    if (constraintAround) {
      const viewport = this.makeViewport(props);
      const {position, screenPosition} = constraintAround;
      if (!(viewport instanceof GlobeViewport) || props.navigation === 'map') {
        Object.assign(
          props,
          viewport instanceof GlobeViewport
            ? viewport.panByPosition(position, screenPosition, undefined, true)
            : viewport.panByPosition(position, screenPosition)
        );
      } else {
        const anchorStrength = viewport.getZoomAnchorStrength(screenPosition);
        if (anchorStrength > 0) {
          const currentCoordinates = viewport.unproject(screenPosition);
          const cameraFrame = Globe.cameraFrame(
            props.longitude,
            props.latitude,
            props.bearing || 0
          );
          const rotatedFrame = Globe.rotateFrameToMatch(
            cameraFrame,
            [currentCoordinates[0], currentCoordinates[1]],
            [position[0], position[1]],
            anchorStrength
          );
          props.longitude = rotatedFrame.longitude;
          props.latitude = rotatedFrame.latitude;
          props.bearing = rotatedFrame.bearing;
        }
      }
    }

    if (props.longitude < -180 || props.longitude > 180) {
      props.longitude = mod(props.longitude + 180, 360) - 180;
    }
    if (props.bearing < -180 || props.bearing > 180) {
      props.bearing = mod(props.bearing + 180, 360) - 180;
    }
    const latitudeLimit = props.navigation === 'map' ? MAX_LATITUDE : 90;
    props.latitude = clamp(props.latitude, -latitudeLimit, latitudeLimit);
    props.pitch = clamp(props.pitch, props.minPitch, props.maxPitch);

    const maxBoundsRect = maxBounds
      ? getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding)
      : null;
    if (maxBounds && maxBoundsRect) {
      // A negative target dimension is inverted and therefore has no legal interval.
      if (maxBoundsRect.width >= 0) {
        props.longitude = clamp(props.longitude, maxBounds[0][0], maxBounds[1][0]);
      }
      if (maxBoundsRect.height >= 0) {
        props.latitude = clamp(props.latitude, maxBounds[0][1], maxBounds[1][1]);
      }
    }

    if (maxBounds && maxBoundsRect) {
      const viewport = this.makeViewport({...props, bearing: 0, pitch: 0});
      const screenExtents = getMaxBoundsExtents(
        viewport,
        [props.longitude, props.latitude],
        maxBoundsRect
      );
      const effectiveZoom = props.zoom - zoomAdjust(latitude);
      const lngSpan = maxBounds[1][0] - maxBounds[0][0];
      const latSpan = maxBounds[1][1] - maxBounds[0][1];
      if (maxBoundsRect.height >= 0 && latSpan > 0 && latSpan < 180) {
        const heightDegrees = Math.min(
          pixelsToDegrees(maxBoundsRect.height, effectiveZoom),
          latSpan
        );
        const bottomDegrees = maxBoundsRect.height
          ? (heightDegrees * screenExtents.bottom) / maxBoundsRect.height
          : pixelsToDegrees(screenExtents.bottom, effectiveZoom);
        const topDegrees = maxBoundsRect.height
          ? (heightDegrees * screenExtents.top) / maxBoundsRect.height
          : pixelsToDegrees(screenExtents.top, effectiveZoom);
        props.latitude = clamp(
          props.latitude,
          maxBounds[0][1] + bottomDegrees,
          maxBounds[1][1] - topDegrees
        );
      }
      if (maxBoundsRect.width >= 0 && lngSpan > 0 && lngSpan < 360) {
        const widthDegrees = Math.min(
          pixelsToDegrees(
            maxBoundsRect.width / Math.cos(props.latitude * DEGREES_TO_RADIANS),
            effectiveZoom
          ),
          lngSpan
        );
        const leftDegrees = maxBoundsRect.width
          ? (widthDegrees * screenExtents.left) / maxBoundsRect.width
          : pixelsToDegrees(
              screenExtents.left / Math.cos(props.latitude * DEGREES_TO_RADIANS),
              effectiveZoom
            );
        const rightDegrees = maxBoundsRect.width
          ? (widthDegrees * screenExtents.right) / maxBoundsRect.width
          : pixelsToDegrees(
              screenExtents.right / Math.cos(props.latitude * DEGREES_TO_RADIANS),
              effectiveZoom
            );
        props.longitude = clamp(
          props.longitude,
          maxBounds[0][0] + leftDegrees,
          maxBounds[1][0] - rightDegrees
        );
      }
    }
    // maxBounds may extend past the globe's coordinate range.
    props.latitude = clamp(props.latitude, -latitudeLimit, latitudeLimit);
    if (props.latitude !== latitude) {
      props.zoom += zoomAdjust(props.latitude, true) - zoomAdjust(latitude, true);
    }

    return props;
  }

  _constrainZoom(zoom: number, props?: Required<MapStateProps>): number {
    props ||= this.getViewportProps();
    const {maxZoom, maxBounds} = props;
    let {minZoom} = props;

    const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;
    if (shouldApplyMaxBounds) {
      const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
      const minLatitude = maxBounds[0][1];
      const maxLatitude = maxBounds[1][1];
      const fitLatitude =
        Math.sign(minLatitude) === Math.sign(maxLatitude)
          ? Math.min(Math.abs(minLatitude), Math.abs(maxLatitude))
          : 0;
      const ZOOM0 = zoomAdjust(0);
      const w =
        degreesToPixels(maxBounds[1][0] - maxBounds[0][0]) *
        Math.cos(fitLatitude * DEGREES_TO_RADIANS);
      const h = degreesToPixels(maxBounds[1][1] - maxBounds[0][1]);
      if (maxBoundsRect.width > 0 && w > 0) {
        minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.width / w) + ZOOM0);
      }
      if (maxBoundsRect.height > 0 && h > 0) {
        minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.height / h) + ZOOM0);
      }
      if (minZoom > maxZoom) minZoom = maxZoom;
    }

    const zoomAdjustment = zoomAdjust(props.latitude, true) - zoomAdjust(0, true);
    return clamp(zoom, minZoom + zoomAdjustment, maxZoom + zoomAdjustment);
  }
}

export default class GlobeController extends Controller<MapState> {
  ControllerState = GlobeState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator({
      transitionProps: {
        compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'],
        required: ['longitude', 'latitude', 'zoom']
      }
    })
  };

  dragMode: 'pan' | 'rotate' = 'pan';

  // Ring buffer tracking globe position during pan for inertia velocity
  private _panHistory: Array<{longitude: number; latitude: number; timestamp: number}> = [];

  /** Update navigation policy without retaining gestures or inertia from the previous mode. */
  setProps(props: ControllerProps & MapStateProps): void {
    const navigation = props.navigation || 'map';
    const navigationChanged = this.props && navigation !== (this.props.navigation || 'map');
    // The event's cached controller state may precede the latest controlled view state.
    const oldViewState = navigationChanged
      ? new this.ControllerState({
          ...(this.props as ControllerProps & MapStateProps),
          makeViewport: this.makeViewport
        }).getViewportProps()
      : undefined;
    if (navigationChanged) {
      this._panHistory = [];
      this._cancelInteraction();
      props = {...props, transitionDuration: 0};
    }
    super.setProps(props);
    if (navigationChanged) {
      this.updateViewport(
        new this.ControllerState({...props, makeViewport: this.makeViewport}),
        null,
        {},
        oldViewState
      );
    }
  }

  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    this._panHistory = [];
    return super._onPanStart(event);
  }

  protected _onMultiPanStart(event: MjolnirGestureEvent): boolean {
    this._panHistory = [];
    return super._onMultiPanStart(event);
  }

  protected _onPanMove(event: MjolnirGestureEvent): boolean {
    if (!this.dragPan) {
      return false;
    }
    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.pan({pos});
    this.updateViewport(
      newControllerState,
      {transitionDuration: 0},
      {
        isDragging: true,
        isPanning: true
      }
    );

    const {longitude, latitude} = newControllerState.getViewportProps();
    this._panHistory.push({longitude, latitude, timestamp: Date.now()});
    if (this._panHistory.length > 5) {
      this._panHistory.shift();
    }

    return true;
  }

  protected _onPanMoveEnd(event: MjolnirGestureEvent): boolean {
    const {inertia} = this;
    if (this.dragPan && inertia && this._panHistory.length >= 2) {
      const first = this._panHistory[0];
      const last = this._panHistory[this._panHistory.length - 1];
      const dt = last.timestamp - first.timestamp;

      if (dt > 0) {
        const viewportProps = this.controllerState.getViewportProps();
        // Compute velocity from the actual positions the globe was at
        const angularDistance = Globe.angularDistance(first, last);
        const angularVelocity = angularDistance / dt;

        if (angularVelocity > 1e-6) {
          const totalAngle = (angularVelocity * inertia) / 2;
          let endLongitude: number;
          let endLatitude: number;
          let interpolator: GlobeInertiaInterpolator;
          if (viewportProps.navigation === 'map') {
            const longitudeDelta = mod(last.longitude - first.longitude + 180, 360) - 180;
            endLongitude = viewportProps.longitude + (longitudeDelta * inertia) / (2 * dt);
            endLatitude = clamp(
              viewportProps.latitude + ((last.latitude - first.latitude) * inertia) / (2 * dt),
              -MAX_LATITUDE,
              MAX_LATITUDE
            );
            interpolator = new GlobeInertiaInterpolator({targetLongitude: endLongitude});
          } else {
            // Spin around one fixed axis so position and up stay in the same
            // rigid camera frame through poles and across the antimeridian.
            const axis = Globe.greatCircleAxis(first, last);
            const currentFrame = Globe.cameraFrame(
              viewportProps.longitude,
              viewportProps.latitude,
              viewportProps.bearing || 0
            );
            const endFrame = Globe.rotateFrame(
              {...currentFrame, axisHorizontal: axis},
              totalAngle,
              0
            );
            endLongitude = endFrame.longitude;
            endLatitude = clamp(endFrame.latitude, -90, 90);
            interpolator = new GlobeInertiaInterpolator({axis, totalAngle});
          }

          const newControllerState = this.controllerState.panEnd();
          this.updateViewport(
            newControllerState,
            {
              transitionInterpolator: interpolator,
              transitionDuration: inertia,
              transitionEasing: GLOBE_INERTIA_EASING,
              longitude: endLongitude,
              latitude: endLatitude
            },
            {
              isDragging: false,
              isPanning: true
            }
          );
          this._panHistory = [];
          return true;
        }
      }
    }

    this._panHistory = [];
    const newControllerState = this.controllerState.panEnd();
    this.updateViewport(newControllerState, null, {
      isDragging: false,
      isPanning: false
    });
    return true;
  }
}
