// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller from './controller';

import {MapState, MapStateProps} from './map-controller';
import type {MapStateInternal} from './map-controller';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';
import GlobeViewport, {zoomAdjust, GLOBE_RADIUS} from '../viewports/globe-viewport';
import {
  Globe,
  type CameraFrame,
  GLOBE_INERTIA_EASING,
  GlobeInertiaInterpolator
} from '../viewports/globe-utils';
import {MAX_LATITUDE} from '@math.gl/web-mercator';

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

type GlobeZoomAround = 'center' | 'pointer';

type GlobeStateInternal = MapStateInternal & {
  startPanPos?: [number, number];
  startPanCameraFrame?: CameraFrame;
  startPanAngularRate?: number;
  /** When true, bearing is held fixed during pan (north stays up) */
  startPanLockBearing?: boolean;
  zoomAround?: GlobeZoomAround;
};

class GlobeState extends MapState {
  constructor(
    options: MapStateProps &
      GlobeStateInternal & {
        makeViewport: (props: Record<string, any>) => any;
        zoomAround?: GlobeZoomAround;
      }
  ) {
    const {
      startPanPos,
      startPanCameraFrame,
      startPanAngularRate,
      startPanLockBearing,
      zoomAround,
      ...mapStateOptions
    } = options;
    mapStateOptions.normalize = false;
    super(mapStateOptions);

    const s = (this as any)._state;
    if (startPanPos !== undefined) s.startPanPos = startPanPos;
    if (startPanCameraFrame !== undefined) s.startPanCameraFrame = startPanCameraFrame;
    if (startPanAngularRate !== undefined) s.startPanAngularRate = startPanAngularRate;
    if (startPanLockBearing !== undefined) s.startPanLockBearing = startPanLockBearing;
    if (zoomAround !== undefined) s.zoomAround = zoomAround;
  }

  panStart({pos}: {pos: [number, number]}): GlobeState {
    const {latitude, longitude, zoom, bearing = 0} = this.getViewportProps();
    const cameraFrame = Globe.cameraFrame(longitude, latitude, bearing);
    const lockBearing = Math.abs(bearing) < 1;

    if (lockBearing) {
      // Override horizontal axis to polar so north stays up.
      // Boost rate by 1/cos(lat) to compensate for smaller longitude
      // circles near the poles, capped at 4x.
      cameraFrame.axisHorizontal = [0, 0, 1];
    }

    // Radians of arc per pixel, derived from zoom scale
    const scale = Math.pow(2, zoom - zoomAdjust(latitude, true));
    const angularRate = (0.25 / scale) * DEGREES_TO_RADIANS;

    return this._getUpdatedState({
      startPanPos: pos,
      startPanCameraFrame: cameraFrame,
      startPanAngularRate: angularRate,
      startPanLockBearing: lockBearing,
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

    const dx = startPanPos[0] - pos[0];
    const dy = startPanPos[1] - pos[1];

    let hAngle = dx * rate;
    let vAngle = -dy * rate;
    const locked = state.startPanLockBearing;

    if (locked) {
      // Boost horizontal rate by 1/cos(lat) for the polar axis, capped at 4x
      const cosLat = Math.cos(frame.latitude * DEGREES_TO_RADIANS);
      hAngle = (dx * rate) / Math.max(cosLat, 0.25);
      // Clamp vertical angle to prevent crossing the poles
      const maxUp = (MAX_LATITUDE - frame.latitude) * DEGREES_TO_RADIANS;
      const maxDown = -(MAX_LATITUDE + frame.latitude) * DEGREES_TO_RADIANS;
      vAngle = clamp(vAngle, maxDown, maxUp);
    }

    const rotated = Globe.rotateFrame(frame, hAngle, vAngle, locked);
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
      startPanLockBearing: null,
      startZoom: null
    }) as GlobeState;
  }

  zoomStart({pos}: {pos: [number, number]}): GlobeState {
    const startZoomLngLat = this._shouldZoomAroundPointer()
      ? this._unprojectOnGlobe(pos)
      : undefined;

    return this._getUpdatedState({
      startZoomLngLat,
      startZoom: this.getViewportProps().zoom
    }) as GlobeState;
  }

  zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): MapState {
    const state = this.getState();
    const {startZoom} = state;
    let {startZoomLngLat} = state;
    const hasZoomStart = startZoom !== undefined;
    const startZoomValue = (startZoom as number) ?? this.getViewportProps().zoom;
    const zoom = this._constrainZoom(startZoomValue + Math.log2(scale));

    if (!this._shouldZoomAroundPointer()) {
      return this._getUpdatedState({zoom});
    }

    if (!startZoomLngLat && !hasZoomStart) {
      startZoomLngLat = this._unprojectOnGlobe(startPos) || this._unprojectOnGlobe(pos);
    }

    if (!startZoomLngLat) {
      return this._getUpdatedState({zoom});
    }

    const zoomedViewport = this.makeViewport({...this.getViewportProps(), zoom}) as GlobeViewport;
    return this._getUpdatedState({
      zoom,
      ...zoomedViewport.panByGlobeAnchor(startZoomLngLat, pos)
    });
  }

  zoomEnd(): GlobeState {
    return this._getUpdatedState({
      startZoomLngLat: null,
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
    const {longitude, latitude, maxBounds} = props;

    props.zoom = this._constrainZoom(props.zoom, props);

    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = clamp(latitude, -90, 90);

    if (props.bearing < -180 || props.bearing > 180) {
      props.bearing = mod(props.bearing + 180, 360) - 180;
    }
    props.pitch = clamp(props.pitch, props.minPitch, props.maxPitch);

    if (maxBounds) {
      props.longitude = clamp(props.longitude, maxBounds[0][0], maxBounds[1][0]);
      props.latitude = clamp(props.latitude, maxBounds[0][1], maxBounds[1][1]);
    }

    if (maxBounds) {
      const effectiveZoom = props.zoom - zoomAdjust(latitude);
      const lngSpan = maxBounds[1][0] - maxBounds[0][0];
      const latSpan = maxBounds[1][1] - maxBounds[0][1];
      if (latSpan > 0 && latSpan < 180) {
        const halfHeightDegrees =
          Math.min(pixelsToDegrees(props.height, effectiveZoom), latSpan) / 2;
        props.latitude = clamp(
          props.latitude,
          maxBounds[0][1] + halfHeightDegrees,
          maxBounds[1][1] - halfHeightDegrees
        );
      }
      if (lngSpan > 0 && lngSpan < 360) {
        const halfWidthDegrees =
          Math.min(
            pixelsToDegrees(
              props.width / Math.cos(props.latitude * DEGREES_TO_RADIANS),
              effectiveZoom
            ),
            lngSpan
          ) / 2;
        props.longitude = clamp(
          props.longitude,
          maxBounds[0][0] + halfWidthDegrees,
          maxBounds[1][0] - halfWidthDegrees
        );
      }
    }
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
      if (w > 0) {
        minZoom = Math.max(minZoom, Math.log2(props.width / w) + ZOOM0);
      }
      if (h > 0) {
        minZoom = Math.max(minZoom, Math.log2(props.height / h) + ZOOM0);
      }
      if (minZoom > maxZoom) minZoom = maxZoom;
    }

    const zoomAdjustment = zoomAdjust(props.latitude, true) - zoomAdjust(0, true);
    return clamp(zoom, minZoom + zoomAdjustment, maxZoom + zoomAdjustment);
  }

  private _unprojectOnGlobe(pos?: [number, number]): [number, number] | undefined {
    if (!pos) {
      return undefined;
    }

    const viewport = this.makeViewport(this.getViewportProps()) as GlobeViewport;
    if (!viewport.isPointOnGlobe(pos)) {
      return undefined;
    }

    const lngLat = viewport.unproject(pos);
    return [lngLat[0], lngLat[1]];
  }

  private _shouldZoomAroundPointer(): boolean {
    return (this.getState() as GlobeStateInternal).zoomAround === 'pointer';
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

  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    this._panHistory = [];
    return super._onPanStart(event);
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
        const state = this.controllerState.getState() as GlobeStateInternal;

        // Compute velocity from the actual positions the globe was at
        const angularDistance = Globe.angularDistance(first, last);
        const angularVelocity = angularDistance / dt;

        if (angularVelocity > 1e-6) {
          const totalAngle = (angularVelocity * inertia) / 2;
          let interpolator: GlobeInertiaInterpolator;
          let endLng: number;
          let endLat: number;

          if (state.startPanLockBearing) {
            // Decompose into lng/lat velocity and extrapolate linearly
            let dLng = last.longitude - first.longitude;
            if (dLng > 180) dLng -= 360;
            else if (dLng < -180) dLng += 360;
            const dLat = last.latitude - first.latitude;
            const vLng = dLng / dt;
            const vLat = dLat / dt;
            endLng = viewportProps.longitude + (vLng * inertia) / 2;
            endLat = clamp(viewportProps.latitude + (vLat * inertia) / 2, -90, 90);

            interpolator = new GlobeInertiaInterpolator({targetLongitude: endLng});
          } else {
            // Free bearing — use single-axis rotation to maintain
            // constant spin direction with up vector tracking.
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
            endLng = endFrame.longitude;
            endLat = clamp(endFrame.latitude, -90, 90);
            interpolator = new GlobeInertiaInterpolator({axis, totalAngle});
          }

          const newControllerState = this.controllerState.panEnd();
          this.updateViewport(
            newControllerState,
            {
              transitionInterpolator: interpolator,
              transitionDuration: inertia,
              transitionEasing: GLOBE_INERTIA_EASING,
              longitude: endLng,
              latitude: endLat
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
