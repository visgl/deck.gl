import TransitionInterpolator from './transition-interpolator';
import {lerp} from 'math.gl';

const DEFAULT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
const DEFAULT_REQUIRED_PROPS = ['longitude', 'latitude', 'zoom'];

/**
 * Performs linear interpolation of two view states.
 */
export default class LinearInterpolator extends TransitionInterpolator {
  /**
   * @param {Object} opts
   * @param {Array} opts.transitionProps - list of props to apply linear transition to.
   * @param {Array} opts.around - a screen point to zoom/rotate around.
   * @param {Function} opts.makeViewport - construct a viewport instance with given props.
   */
  constructor(opts = {}) {
    // Backward compatibility
    const transitionProps = Array.isArray(opts) ? opts : opts.transitionProps;
    super(
      transitionProps || {
        compare: DEFAULT_PROPS,
        extract: DEFAULT_PROPS,
        required: DEFAULT_REQUIRED_PROPS
      }
    );
    this.opts = opts;
  }

  initializeProps(startProps, endProps) {
    const result = super.initializeProps(startProps, endProps);

    const {makeViewport, around} = this.opts;
    if (makeViewport && around) {
      const startViewport = makeViewport(startProps);
      const endViewport = makeViewport(endProps);
      const aroundPosition = startViewport.unproject(around);
      result.start.around = around;
      Object.assign(result.end, {
        around: endViewport.project(aroundPosition),
        aroundPosition,
        width: endProps.width,
        height: endProps.height
      });
    }

    return result;
  }

  interpolateProps(startProps, endProps, t) {
    const propsInTransition = {};
    for (const key of this._propsToExtract) {
      propsInTransition[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
    }

    if (endProps.aroundPosition) {
      // Linear transition should be performed in common space
      const viewport = this.opts.makeViewport({...endProps, ...propsInTransition});
      Object.assign(
        propsInTransition,
        viewport.panByPosition(
          endProps.aroundPosition,
          // anchor point in current screen coordinates
          lerp(startProps.around, endProps.around, t)
        )
      );
    }
    return propsInTransition;
  }
}
