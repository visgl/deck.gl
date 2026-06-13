// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import TransitionInterpolator from './transition-interpolator';
import {clamp, lerp, vec3} from '@math.gl/core';

import type Viewport from '../viewports/viewport';
import GlobeViewport, {zoomAdjust} from '../viewports/globe-viewport';
import {Globe} from '../viewports/globe-utils';
import {flyToViewport, getFlyToDuration} from '@math.gl/web-mercator';

const LINEARLY_INTERPOLATED_PROPS = {
  bearing: 0,
  pitch: 0,
  position: [0, 0, 0]
};
const DEFAULT_OPTS = {
  speed: 1.2,
  curve: 1.414
};

type FlyToInterpolatorOptions = {
  /** The zooming "curve" that will occur along the flight path. Default 1.414 */
  curve?: number;
  /** The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default 1.2 */
  speed?: number;
  /** The average speed of the animation measured in screenfuls per second. Similar to `opts.speed` it linearly affects the duration,  when specified `opts.speed` is ignored. */
  screenSpeed?: number;
  /** Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned. */
  maxDuration?: number;
  /** Construct the active viewport for the current view state. Injected by controllers when available. */
  makeViewport?: (props: Record<string, any>) => Viewport | null | undefined;
};

type FlyToViewportProps = {
  width: number;
  height: number;
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

function getFlyToViewportProps(props: Record<string, any>): FlyToViewportProps {
  return {
    width: props.width,
    height: props.height,
    longitude: props.longitude,
    latitude: props.latitude,
    zoom: props.zoom,
    bearing: props.bearing,
    pitch: props.pitch
  };
}

function getFlyToOptions(
  opts: FlyToInterpolator['opts']
): Omit<FlyToInterpolatorOptions, 'makeViewport'> {
  const {makeViewport, ...flyToOptions} = opts;
  return flyToOptions;
}

function isGlobeViewportTransition(
  startProps: Record<string, any>,
  endProps: Record<string, any>,
  makeViewport?: (props: Record<string, any>) => Viewport | null | undefined
): boolean {
  if (!makeViewport) {
    return false;
  }

  return (
    makeViewport(startProps) instanceof GlobeViewport ||
    makeViewport(endProps) instanceof GlobeViewport
  );
}

function normalizeAngle(value: number): number {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function lerpAngle(start: number, end: number, t: number): number {
  return normalizeAngle(start + normalizeAngle(end - start) * t);
}

function slerpPosition(start: number[], end: number[], t: number): number[] {
  const dot = clamp(vec3.dot(start, end), -1, 1);
  const omega = Math.acos(dot);

  if (omega < 1e-6) {
    return vec3.normalize(
      [],
      [
        lerp(start[0], end[0], t),
        lerp(start[1], end[1], t),
        lerp(start[2], end[2], t)
      ]
    ) as number[];
  }

  const sinOmega = Math.sin(omega);
  if (Math.abs(sinOmega) < 1e-6) {
    let axis = vec3.cross([], start, [0, 0, 1]);
    if (vec3.len(axis) < 1e-6) {
      axis = vec3.cross([], start, [0, 1, 0]);
    }
    vec3.normalize(axis, axis);
    return Globe.rotate(start, axis, Math.PI * t);
  }

  const startScale = Math.sin((1 - t) * omega) / sinOmega;
  const endScale = Math.sin(t * omega) / sinOmega;
  return [
    start[0] * startScale + end[0] * endScale,
    start[1] * startScale + end[1] * endScale,
    start[2] * startScale + end[2] * endScale
  ];
}

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
 */
export default class FlyToInterpolator extends TransitionInterpolator {
  opts: Required<Pick<FlyToInterpolatorOptions, 'curve' | 'speed'>> &
    Omit<FlyToInterpolatorOptions, 'curve' | 'speed'>;

  constructor(opts: FlyToInterpolatorOptions = {}) {
    super({
      compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
      extract: ['width', 'height', 'longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
      required: ['width', 'height', 'latitude', 'longitude', 'zoom']
    });
    this.opts = {...DEFAULT_OPTS, ...opts};
  }

  interpolateProps(startProps, endProps, t) {
    const flyToOptions = getFlyToOptions(this.opts);
    const useGlobeViewport = isGlobeViewportTransition(startProps, endProps, this.opts.makeViewport);
    const viewport = useGlobeViewport
      ? this._interpolateGlobeProps(startProps, endProps, t, flyToOptions)
      : flyToViewport(startProps, endProps, t, flyToOptions);

    // Linearly interpolate 'bearing', 'pitch' and 'position'.
    // If they are not supplied, they are interpreted as zeros in viewport calculation
    // (fallback defined in WebMercatorViewport)
    // Because there is no guarantee that the current controller's ViewState normalizes
    // these props, safe guard is needed to avoid generating NaNs
    for (const key in LINEARLY_INTERPOLATED_PROPS) {
      const startValue = startProps[key] || LINEARLY_INTERPOLATED_PROPS[key];
      const endValue = endProps[key] || LINEARLY_INTERPOLATED_PROPS[key];
      viewport[key] =
        useGlobeViewport && key === 'bearing'
          ? lerpAngle(startValue, endValue, t)
          : lerp(startValue, endValue, t);
    }

    return viewport;
  }

  private _interpolateGlobeProps(startProps, endProps, t, flyToOptions) {
    const startPosition = Globe.toPosition(startProps.longitude, startProps.latitude);
    const endPosition = Globe.toPosition(endProps.longitude, endProps.latitude);
    const [longitude, latitude] = Globe.toLngLat(slerpPosition(startPosition, endPosition, t));
    const flyTo = flyToViewport(
      getFlyToViewportProps(startProps),
      getFlyToViewportProps(endProps),
      t,
      flyToOptions
    );
    const flyToScaleZoom = flyTo.zoom - zoomAdjust(flyTo.latitude, true);
    const zoom = flyToScaleZoom + zoomAdjust(latitude, true);

    return {
      longitude,
      latitude,
      zoom
    };
  }

  // computes the transition duration
  getDuration(startProps, endProps) {
    let {transitionDuration} = endProps;
    if (transitionDuration === 'auto') {
      // auto calculate duration based on start and end props
      transitionDuration = getFlyToDuration(startProps, endProps, getFlyToOptions(this.opts));
    }
    return transitionDuration;
  }
}
