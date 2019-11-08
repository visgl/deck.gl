import TransitionInterpolator from './transition-interpolator';
import {lerp} from 'math.gl';

import {flyToViewport, getFlyToDuration} from '@math.gl/web-mercator';

const LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];
const DEFAULT_OPTS = {
  speed: 1.2,
  curve: 1.414
  // screenSpeed and maxDuration are used only if specified
};

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
 */
export default class FlyToInterpolator extends TransitionInterpolator {
  /**
   * @param props {Object}
    - `props.curve` (Number, optional, default: 1.414) - The zooming "curve" that will occur along the flight path.
    - `props.speed` (Number, optional, default: 1.2) - The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa.
    - `props.screenSpeed` (Number, optional) - The average speed of the animation measured in screenfuls per second. Similar to `opts.speed` it linearly affects the duration,  when specified `opts.speed` is ignored.
    - `props.maxDuration` (Number, optional) - Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned.
   */
  constructor(props = {}) {
    super({
      compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'],
      extract: ['width', 'height', 'longitude', 'latitude', 'zoom', 'bearing', 'pitch'],
      required: ['width', 'height', 'latitude', 'longitude', 'zoom']
    });
    this.props = Object.assign({}, DEFAULT_OPTS, props);
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = flyToViewport(startProps, endProps, t, this.props);

    // Linearly interpolate 'bearing' and 'pitch'.
    // If pitch/bearing are not supplied, they are interpreted as zeros in viewport calculation
    // (fallback defined in WebMercatorViewport)
    // Because there is no guarantee that the current controller's ViewState normalizes
    // these props, safe guard is needed to avoid generating NaNs
    for (const key of LINEARLY_INTERPOLATED_PROPS) {
      viewport[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
    }

    return viewport;
  }

  // computes the transition duration
  getDuration(startProps, endProps) {
    let {transitionDuration} = endProps;
    if (transitionDuration === 'auto') {
      // auto calculate duration based on start and end props
      transitionDuration = getFlyToDuration(startProps, endProps, this.props);
    }
    return transitionDuration;
  }
}
