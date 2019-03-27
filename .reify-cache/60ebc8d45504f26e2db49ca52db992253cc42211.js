"use strict";module.export({default:()=>LinearInterpolator});var TransitionInterpolator;module.link('./transition-interpolator',{default(v){TransitionInterpolator=v}},0);var lerp;module.link('math.gl',{lerp(v){lerp=v}},1);


const VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

/**
 * Performs linear interpolation of two view states.
 */
class LinearInterpolator extends TransitionInterpolator {
  /**
   * @param {Array} transitionProps - list of props to apply linear transition to.
   */
  constructor(transitionProps = VIEWPORT_TRANSITION_PROPS) {
    super(transitionProps);
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = {};
    for (const key in endProps) {
      viewport[key] = lerp(startProps[key], endProps[key], t);
    }
    return viewport;
  }
}
