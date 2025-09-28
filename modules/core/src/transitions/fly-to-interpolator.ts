// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import TransitionInterpolator from './transition-interpolator';
import {lerp} from '@math.gl/core';

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

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
 */
export default class FlyToInterpolator extends TransitionInterpolator {
  opts: {
    curve: number;
    speed: number;
    screenSpeed?: number;
    maxDuration?: number;
  };

  constructor(
    opts: {
      /** The zooming "curve" that will occur along the flight path. Default 1.414 */
      curve?: number;
      /** The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default 1.2 */
      speed?: number;
      /** The average speed of the animation measured in screenfuls per second. Similar to `opts.speed` it linearly affects the duration,  when specified `opts.speed` is ignored. */
      screenSpeed?: number;
      /** Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned. */
      maxDuration?: number;
    } = {}
  ) {
    super({
      compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
      extract: ['width', 'height', 'longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
      required: ['width', 'height', 'latitude', 'longitude', 'zoom']
    });
    this.opts = {...DEFAULT_OPTS, ...opts};
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = flyToViewport(startProps, endProps, t, this.opts);

    // Linearly interpolate 'bearing', 'pitch' and 'position'.
    // If they are not supplied, they are interpreted as zeros in viewport calculation
    // (fallback defined in WebMercatorViewport)
    // Because there is no guarantee that the current controller's ViewState normalizes
    // these props, safe guard is needed to avoid generating NaNs
    for (const key in LINEARLY_INTERPOLATED_PROPS) {
      viewport[key] = lerp(
        startProps[key] || LINEARLY_INTERPOLATED_PROPS[key],
        endProps[key] || LINEARLY_INTERPOLATED_PROPS[key],
        t
      );
    }

    return viewport;
  }

  // computes the transition duration
  getDuration(startProps, endProps) {
    let {transitionDuration} = endProps;
    if (transitionDuration === 'auto') {
      // auto calculate duration based on start and end props
      transitionDuration = getFlyToDuration(startProps, endProps, this.opts);
    }
    return transitionDuration;
  }
}
