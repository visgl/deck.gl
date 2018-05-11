import TransitionInterpolator from './transition-interpolator';
import {isValid, getEndValueByShortestPath} from './transition-utils';
import {lerp} from './../utils/math-utils';
import assert from '../utils/assert';

const VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

/**
 * Performs linear interpolation of two view states.
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
    const startViewStateProps = {};
    const endViewStateProps = {};

    for (const key of this.propNames) {
      const startValue = startProps[key];
      const endValue = endProps[key];
      assert(isValid(startValue) && isValid(endValue), `${key} must be supplied for transition`);

      startViewStateProps[key] = startValue;
      endViewStateProps[key] = getEndValueByShortestPath(key, startValue, endValue);
    }

    return {
      start: startViewStateProps,
      end: endViewStateProps
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
