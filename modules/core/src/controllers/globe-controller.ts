// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import {MAX_LATITUDE} from '@math.gl/web-mercator';
import Controller, {type ControllerProps} from './controller';
import {applyRubberBand, getMaxBoundsExtents, getMaxBoundsRect} from './utils';

import {MapState, MapStateProps} from './map-controller';
import type {MapStateInternal} from './map-controller';
import {CONSTRAINT_AROUND, type ConstraintAround, type ConstraintContext} from './view-state';
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
const ZOOM_RUBBER_BAND_RANGE = 1;
const ROTATION_RUBBER_BAND_RANGE = 15;

type GlobeConstraintContext = ConstraintContext & {
  // A compound gesture must not apply resistance twice to an unchanged component.
  changedProps?: string[];
};

function hasBearingLimits({minBearing, maxBearing}: Required<MapStateProps>): boolean {
  return (
    (Number.isFinite(minBearing) || Number.isFinite(maxBearing)) &&
    !(Number.isFinite(minBearing) && Number.isFinite(maxBearing) && maxBearing - minBearing >= 360)
  );
}

function alignBearing(bearing: number, reference: number): number {
  return reference + mod(bearing - reference + 180, 360) - 180;
}

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
        constraintContext?: GlobeConstraintContext;
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

  panStart({pos}: {pos: [number, number]}, constraintContext?: ConstraintContext): GlobeState {
    const {latitude, longitude, zoom, bearing = 0} = this.getViewportProps();
    const cameraFrame = Globe.cameraFrame(longitude, latitude, bearing);
    if (this.getViewportProps().navigation === 'map') {
      // Resolve map navigation against geographic axes, even with a rotated bearing.
      cameraFrame.axisHorizontal = [0, 0, 1];
      cameraFrame.axisVertical = Globe.cameraFrame(longitude, latitude, 0).axisVertical;
    }

    // Radians of arc per pixel, derived from zoom scale
    const scale = Math.pow(2, zoom - zoomAdjust(latitude, true));
    const angularRate = (0.25 / scale) * DEGREES_TO_RADIANS;

    return this._getUpdatedState(
      {
        startPanPos: pos,
        startPanCameraFrame: cameraFrame,
        startPanAngularRate: angularRate,
        startZoom: zoom
      },
      constraintContext
    );
  }

  pan(
    {pos, startPos}: {pos: [number, number]; startPos?: [number, number]},
    constraintContext?: ConstraintContext
  ): GlobeState {
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

    return this._getUpdatedState(
      {
        longitude: rotated.longitude,
        latitude: rotated.latitude,
        bearing: hasBearingLimits(this.getViewportProps())
          ? alignBearing(rotated.bearing, frame.bearing)
          : rotated.bearing,
        zoom
      },
      constraintContext
    );
  }

  panEnd(constraintContext?: ConstraintContext): GlobeState {
    return this._getUpdatedState(
      {
        startPanPos: null,
        startPanCameraFrame: null,
        startPanAngularRate: null,
        startZoom: null
      },
      constraintContext
    );
  }

  _panFromCenter(offset: [number, number], constraintContext?: ConstraintContext): GlobeState {
    const {width, height} = this.getViewportProps();
    const center: [number, number] = [width / 2, height / 2];
    return this.panStart({pos: center}, constraintContext)
      .pan({pos: [center[0] + offset[0], center[1] + offset[1]]}, constraintContext)
      .panEnd(constraintContext);
  }

  applyConstraints(
    props: Required<MapStateProps>,
    constraintContext?: GlobeConstraintContext
  ): Required<MapStateProps> {
    const internalProps = props as typeof props & ConstraintAround;
    const constraintAround = internalProps[CONSTRAINT_AROUND];
    delete internalProps[CONSTRAINT_AROUND];
    const {latitude, maxBounds, rubberBand} = props;
    const shouldRubberBand = rubberBand && constraintContext?.mode === 'elastic';
    const preserve = constraintContext?.mode === 'preserve';
    const constrain = (key: keyof MapStateProps, value: number, limit: number, range: number) => {
      if (
        preserve ||
        (shouldRubberBand &&
          constraintContext?.changedProps &&
          !constraintContext.changedProps.includes(key))
      ) {
        return value;
      }
      return shouldRubberBand ? applyRubberBand(value, limit, range) : limit;
    };

    props.zoom = constrain(
      'zoom',
      props.zoom,
      this._constrainZoom(props.zoom, props),
      ZOOM_RUBBER_BAND_RANGE
    );

    if (constraintAround) {
      const viewport = this.makeViewport(props);
      const anchorStrength =
        viewport instanceof GlobeViewport
          ? viewport.getZoomAnchorStrength(constraintAround.screenPosition)
          : 0;
      if (!(viewport instanceof GlobeViewport) || props.navigation === 'map') {
        Object.assign(
          props,
          viewport instanceof GlobeViewport
            ? viewport.panByPosition(
                constraintAround.position,
                constraintAround.screenPosition,
                undefined,
                true
              )
            : viewport.panByPosition(constraintAround.position, constraintAround.screenPosition)
        );
      } else if (anchorStrength > 0) {
        const currentCoordinates = viewport.unproject(constraintAround.screenPosition);
        const cameraFrame = Globe.cameraFrame(props.longitude, props.latitude, props.bearing || 0);
        const rotatedFrame = Globe.rotateFrameToMatch(
          cameraFrame,
          [currentCoordinates[0], currentCoordinates[1]],
          [constraintAround.position[0], constraintAround.position[1]],
          anchorStrength
        );
        props.longitude = rotatedFrame.longitude;
        props.latitude = rotatedFrame.latitude;
        props.bearing = hasBearingLimits(props)
          ? alignBearing(rotatedFrame.bearing, props.bearing)
          : rotatedFrame.bearing;
      }
    }

    if (props.longitude < -180 || props.longitude > 180) {
      props.longitude = mod(props.longitude + 180, 360) - 180;
    }
    if (hasBearingLimits(props)) {
      // Keep bounded angles on their configured turn. Wrapping an overshoot can
      // put it inside the opposite limit and lose the correct rebound direction.
      props.bearing = constrain(
        'bearing',
        props.bearing,
        clamp(props.bearing, props.minBearing, props.maxBearing),
        ROTATION_RUBBER_BAND_RANGE
      );
    } else {
      props.bearing = mod(props.bearing + 180, 360) - 180;
    }
    const latitudeLimit = props.navigation === 'map' ? MAX_LATITUDE : 90;
    props.latitude = clamp(props.latitude, -latitudeLimit, latitudeLimit);
    props.pitch = constrain(
      'pitch',
      props.pitch,
      clamp(props.pitch, props.minPitch, props.maxPitch),
      ROTATION_RUBBER_BAND_RANGE
    );

    const requestedLongitude = props.longitude;
    const requestedLatitude = props.latitude;

    const maxBoundsRect = maxBounds
      ? getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding)
      : null;
    if (maxBounds && maxBoundsRect && !preserve) {
      // A negative target dimension is inverted and therefore has no legal interval.
      if (maxBoundsRect.width >= 0) {
        props.longitude = clamp(props.longitude, maxBounds[0][0], maxBounds[1][0]);
      }
      if (maxBoundsRect.height >= 0) {
        props.latitude = clamp(props.latitude, maxBounds[0][1], maxBounds[1][1]);
      }
    }

    if (maxBounds && maxBoundsRect && !preserve) {
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
      props.longitude = constrain(
        'longitude',
        requestedLongitude,
        props.longitude,
        pixelsToDegrees(
          Math.max(0, maxBoundsRect.width) /
            2 /
            Math.max(Math.cos(requestedLatitude * DEGREES_TO_RADIANS), 1e-6),
          effectiveZoom
        )
      );
      props.latitude = constrain(
        'latitude',
        requestedLatitude,
        props.latitude,
        pixelsToDegrees(Math.max(0, maxBoundsRect.height) / 2, effectiveZoom)
      );
    }
    // maxBounds may extend past the globe's coordinate range.
    props.latitude = clamp(props.latitude, -latitudeLimit, latitudeLimit);
    if (props.latitude !== latitude) {
      props.zoom += zoomAdjust(props.latitude, true) - zoomAdjust(latitude, true);
    }

    return props;
  }

  shortestPathFrom(viewState: MapState): MapStateProps {
    const props = super.shortestPathFrom(viewState);
    const viewportProps = this.getViewportProps();
    const {maxBounds} = viewportProps;
    if (maxBounds && maxBounds[1][0] - maxBounds[0][0] < 360) {
      props.longitude = this.getViewportProps().longitude;
    }
    if (hasBearingLimits(viewportProps)) {
      props.bearing = viewportProps.bearing;
    }
    return props;
  }

  _getUpdatedState(newProps, constraintContext?: ConstraintContext): GlobeState {
    let globeConstraintContext: GlobeConstraintContext | undefined = constraintContext;
    if (constraintContext?.mode === 'elastic') {
      const changedProps = Object.keys(newProps);
      if (newProps[CONSTRAINT_AROUND]) {
        changedProps.push('longitude', 'latitude', 'bearing');
      }
      globeConstraintContext = {...globeConstraintContext, ...constraintContext, changedProps};
    }
    return super._getUpdatedState(newProps, globeConstraintContext) as GlobeState;
  }

  _getNewRotation(
    pos: [number, number],
    startPos: [number, number],
    startPitch: number,
    startBearing: number,
    constraintContext?: ConstraintContext
  ): {pitch: number; bearing: number} {
    const rotation = super._getNewRotation(pos, startPos, startPitch, startBearing);
    const {rubberBand, minPitch, maxPitch, height} = this.getViewportProps();
    if (rubberBand && constraintContext?.mode === 'elastic' && height > 0) {
      // Use a fixed angular scale so dragging outwards still works at either pitch limit.
      rotation.pitch =
        startPitch + ((startPos[1] - pos[1]) / height) * Math.max(1, maxPitch - minPitch);
    }
    return rotation;
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
    const newControllerState = this.controllerState.pan(
      {pos},
      this._getConstraintContext('pan', 'update')
    );
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
    const constraintContext = this._getConstraintContext('pan', 'end');
    const settledState = this.controllerState.panEnd(constraintContext);
    const reboundTransition = this._getReboundTransition(constraintContext, settledState);
    if (reboundTransition) {
      this._panHistory = [];
      this.updateViewport(settledState, reboundTransition, {isDragging: false, isPanning: true});
      return true;
    }
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
          let endLongitude: number;
          let endLatitude: number;
          let endBearing = viewportProps.bearing;
          let interpolator: GlobeInertiaInterpolator | LinearInterpolator;
          if (viewportProps.navigation === 'map') {
            const longitudeDelta = mod(last.longitude - first.longitude + 180, 360) - 180;
            endLongitude = viewportProps.longitude + (longitudeDelta * inertia) / (2 * dt);
            const {maxBounds} = viewportProps;
            if (maxBounds && maxBounds[1][0] - maxBounds[0][0] < 360) {
              // Preserve fling direction before the endpoint is normalized to longitude.
              endLongitude = clamp(endLongitude, maxBounds[0][0], maxBounds[1][0]);
            }
            endLatitude = clamp(
              viewportProps.latitude + ((last.latitude - first.latitude) * inertia) / (2 * dt),
              -MAX_LATITUDE,
              MAX_LATITUDE
            );
            interpolator = new GlobeInertiaInterpolator({targetLongitude: endLongitude});
          } else {
            const totalAngle = (angularVelocity * inertia) / 2;
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
            endBearing = hasBearingLimits(viewportProps)
              ? alignBearing(endFrame.bearing, viewportProps.bearing)
              : endFrame.bearing;
            interpolator = new GlobeInertiaInterpolator({axis, totalAngle});
          }
          // Bounded views must interpolate to the constrained endpoint. A rigid spin
          // ignores that endpoint and could finish outside the configured limits.
          const hasBounds = viewportProps.maxBounds || hasBearingLimits(viewportProps);
          if (hasBounds) interpolator = this.transition.transitionInterpolator;

          const newControllerState = this.controllerState.panEnd();
          this.updateViewport(
            newControllerState,
            {
              transitionInterpolator: interpolator,
              transitionDuration: inertia,
              transitionEasing: GLOBE_INERTIA_EASING,
              longitude: endLongitude,
              latitude: endLatitude,
              bearing: endBearing,
              zoom:
                viewportProps.zoom +
                zoomAdjust(endLatitude, true) -
                zoomAdjust(viewportProps.latitude, true)
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
    this.updateViewport(settledState, null, {
      isDragging: false,
      isPanning: false
    });
    return true;
  }
}
