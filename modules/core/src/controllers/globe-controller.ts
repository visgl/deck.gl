// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';

import {MapState, MapStateProps} from './map-controller';
import type {MapStateInternal} from './map-controller';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';
import {zoomAdjust} from '../viewports/globe-viewport';

import {MAX_LATITUDE} from '@math.gl/web-mercator';

type GlobeStateInternal = MapStateInternal & {
  startPanPos?: [number, number];
};

class GlobeState extends MapState {
  constructor(
    options: MapStateProps &
      GlobeStateInternal & {
        makeViewport: (props: Record<string, any>) => any;
      }
  ) {
    const {startPanPos, ...mapStateOptions} = options;
    super(mapStateOptions);

    if (startPanPos !== undefined) {
      (this as any)._state.startPanPos = startPanPos;
    }
  }

  panStart({pos}: {pos: [number, number]}): GlobeState {
    const {latitude, longitude, zoom} = this.getViewportProps();
    return this._getUpdatedState({
      startPanLngLat: [longitude, latitude],
      startPanPos: pos,
      startZoom: zoom
    }) as GlobeState;
  }

  pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): GlobeState {
    const state = this.getState() as GlobeStateInternal;
    const startPanLngLat = state.startPanLngLat || this._unproject(startPos);
    if (!startPanLngLat) return this;
    const startZoom = state.startZoom ?? this.getViewportProps().zoom;
    const startPanPos = state.startPanPos || startPos;

    const coords = [startPanLngLat[0], startPanLngLat[1], startZoom];
    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(coords, pos, startPanPos);
    return this._getUpdatedState(newProps) as GlobeState;
  }

  panEnd(): GlobeState {
    return this._getUpdatedState({
      startPanLngLat: null,
      startPanPos: null,
      startZoom: null
    }) as GlobeState;
  }

  zoom({scale}: {scale: number}): MapState {
    // In Globe view zoom does not take into account the mouse position
    const startZoom = this.getState().startZoom || this.getViewportProps().zoom;
    const zoom = startZoom + Math.log2(scale);
    return this._getUpdatedState({zoom});
  }

  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps> {
    // Ensure zoom is within specified range
    const {longitude, latitude, maxZoom, minZoom, zoom} = props;

    const ZOOM0 = zoomAdjust(0);
    const zoomAdjustment = zoomAdjust(latitude) - ZOOM0;
    props.zoom = clamp(zoom, minZoom + zoomAdjustment, maxZoom + zoomAdjustment);

    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = clamp(latitude, -MAX_LATITUDE, MAX_LATITUDE);

    return props;
  }
}

export default class GlobeController extends Controller<MapState> {
  ControllerState = GlobeState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator(['longitude', 'latitude', 'zoom'])
  };

  dragMode: 'pan' | 'rotate' = 'pan';

  setProps(props: ControllerProps) {
    super.setProps(props);

    // TODO - support pitching?
    this.dragRotate = false;
    this.touchRotate = false;
  }
}
