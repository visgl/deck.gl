// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller from './controller';

import {MapState, MapStateProps} from './map-controller';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';
import {zoomAdjust, GLOBE_RADIUS} from '../viewports/globe-viewport';

import {MAX_LATITUDE} from '@math.gl/web-mercator';

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

class GlobeState extends MapState {
  constructor(
    options: MapStateProps & {
      makeViewport: (props: Record<string, any>) => any;
    }
  ) {
    // Disable MapState's default web-mercator bounds; globe covers the whole earth.
    // Pan (panStart/pan/panEnd) is inherited from MapState so the grabbed lng/lat
    // stays under the cursor — matching MapView. The old globe-specific delta-pan
    // produced the wrong on-screen speed and yanked the center at zoom > 12 (where
    // WebMercatorViewport takes over rendering but ignored the delta third-arg).
    super({...options, normalize: false});
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
    let {startZoom, startZoomLngLat} = this.getState();

    if (!startZoomLngLat) {
      startZoom = this.getViewportProps().zoom;
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
    }

    const zoom = this._constrainZoom((startZoom as number) + Math.log2(scale));

    if (!startZoomLngLat) {
      // Cursor is off the globe — fall back to center zoom
      return this._getUpdatedState({zoom});
    }

    const zoomedViewport = this.makeViewport({...this.getViewportProps(), zoom});
    return this._getUpdatedState({
      zoom,
      ...zoomedViewport.panByPosition(startZoomLngLat, pos)
    });
  }

  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps> {
    // Ensure zoom is within specified range
    const {longitude, latitude, maxBounds, maxPitch, minPitch} = props;

    props.zoom = this._constrainZoom(props.zoom, props);

    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = clamp(latitude, -MAX_LATITUDE, MAX_LATITUDE);

    // Normalize bearing to [-180, 180]
    if (props.bearing < -180 || props.bearing > 180) {
      props.bearing = mod(props.bearing + 180, 360) - 180;
    }

    // Clamp pitch to [minPitch, maxPitch]
    props.pitch = clamp(props.pitch, minPitch, maxPitch);

    if (maxBounds) {
      props.longitude = clamp(props.longitude, maxBounds[0][0], maxBounds[1][0]);
      props.latitude = clamp(props.latitude, maxBounds[0][1], maxBounds[1][1]);
    }

    if (maxBounds) {
      // calculate center and zoom ranges at pitch=0 and bearing=0
      // to maintain visual stability when rotating
      const effectiveZoom = props.zoom - zoomAdjust(latitude);
      const lngSpan = maxBounds[1][0] - maxBounds[0][0];
      const latSpan = maxBounds[1][1] - maxBounds[0][1];
      if (latSpan > 0 && latSpan < MAX_LATITUDE * 2) {
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
      props.zoom += zoomAdjust(props.latitude) - zoomAdjust(latitude);
    }

    return props;
  }

  _constrainZoom(zoom: number, props?: Required<MapStateProps>): number {
    props ||= this.getViewportProps();
    const {latitude, maxZoom, maxBounds} = props;
    let {minZoom} = props;
    const ZOOM0 = zoomAdjust(0);
    const zoomAdjustment = zoomAdjust(latitude) - ZOOM0;

    const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;
    if (shouldApplyMaxBounds) {
      const minLatitude = maxBounds[0][1];
      const maxLatitude = maxBounds[1][1];
      // latitude at which the bounding box is the widest
      const fitLatitude =
        Math.sign(minLatitude) === Math.sign(maxLatitude)
          ? Math.min(Math.abs(minLatitude), Math.abs(maxLatitude))
          : 0;
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

    return clamp(zoom, minZoom + zoomAdjustment, maxZoom + zoomAdjustment);
  }
}

export default class GlobeController extends Controller<MapState> {
  ControllerState = GlobeState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator([
      'longitude',
      'latitude',
      'zoom',
      'bearing',
      'pitch'
    ])
  };

  dragMode: 'pan' | 'rotate' = 'pan';
}
