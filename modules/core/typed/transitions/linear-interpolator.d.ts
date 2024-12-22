import TransitionInterpolator from './transition-interpolator';
import type Viewport from '../viewports/viewport';
declare type PropsWithAnchor = {
  around?: number[];
  aroundPosition?: number[];
  [key: string]: any;
};
/**
 * Performs linear interpolation of two view states.
 */
export default class LinearInterpolator extends TransitionInterpolator {
  opts: {
    around?: number[];
    makeViewport?: (props: Record<string, any>) => Viewport;
  };
  /**
   * @param {Object} opts
   * @param {Array} opts.transitionProps - list of props to apply linear transition to.
   * @param {Array} opts.around - a screen point to zoom/rotate around.
   * @param {Function} opts.makeViewport - construct a viewport instance with given props.
   */
  constructor(
    opts?:
      | string[]
      | {
          transitionProps?:
            | string[]
            | {
                compare: string[];
                extract?: string[];
                required?: string[];
              };
          around?: number[];
          makeViewport?: (props: Record<string, any>) => Viewport;
        }
  );
  initializeProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>
  ): {
    start: PropsWithAnchor;
    end: PropsWithAnchor;
  };
  interpolateProps(
    startProps: PropsWithAnchor,
    endProps: PropsWithAnchor,
    t: number
  ): Record<string, any>;
}
export {};
// # sourceMappingURL=linear-interpolator.d.ts.map
