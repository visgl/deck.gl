import TransitionInterpolator from './transition-interpolator';
import {lerp} from 'math.gl';

const DEFAULT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
const DEFAULT_REQUIRED_PROPS = ['longitude', 'latitude', 'zoom'];

/**
 * Performs linear interpolation of two view states.
 */
export default class LinearInterpolator extends TransitionInterpolator {
  /**
   * @param {Array} transitionProps - list of props to apply linear transition to.
   */
  constructor(transitionProps) {
    super(
      transitionProps || {
        compare: DEFAULT_PROPS,
        extract: DEFAULT_PROPS,
        required: DEFAULT_REQUIRED_PROPS
      }
    );
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = {};
    for (const key in endProps) {
      viewport[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
    }
    return viewport;
  }
}
