import assert from 'assert';
import TransitionInterpolator from './transition-interpolator';

import {isValid, lerp, getEndValueByShortestPath} from './transition-utils';

const VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

/**
 * Performs linear interpolation of two viewports.
*/
export default class LinearInterpolator extends TransitionInterpolator {

  /**
   * @param {Array} transitionProps - list of props to apply linear transition to.
   */
  constructor(transitionProps = VIEWPORT_TRANSITION_PROPS) {
    super();
    this.propNames = transitionProps;
  }

  initializeProps(startProps, endProps) {
    const startViewportProps = {};
    const endViewportProps = {};

    for (const key of this.propNames) {
      const startValue = startProps[key];
      const endValue = endProps[key];
      assert(isValid(startValue) && isValid(endValue), `${key} must be supplied for transition`);

      startViewportProps[key] = startValue;
      endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
    }

    return {
      start: startViewportProps,
      end: endViewportProps
    };
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = {};
    for (const key of this.propNames) {
      viewport[key] = lerp(startProps[key], endProps[key], t);
    }
    return viewport;
  }

}
