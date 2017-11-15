import assert from 'assert';
import TransitionInterpolator from './transition-interpolator';

import {isValid, lerp, isWrappedAngularProp} from './transition-utils';

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

  interpolateProps(startProps, endProps, t) {
    const viewport = {};

    for (const key of this.propNames) {
      const startValue = startProps[key];
      let endValue = endProps[key];
      assert(isValid(startValue));
      assert(isValid(endValue));

      if (isWrappedAngularProp(key) && Math.abs(endValue - startValue) > 180) {
        endValue = (endValue < 0) ? endValue + 360 : endValue - 360;
      }

      viewport[key] = lerp(startValue, endValue, t);
    }
    return viewport;
  }

}
