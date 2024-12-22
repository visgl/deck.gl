export default abstract class TransitionInterpolator {
  protected _propsToCompare: string[];
  protected _propsToExtract: string[];
  protected _requiredProps?: string[];
  /**
   * @param opts {array|object}
   * @param opts.compare {array} - prop names used in equality check
   * @param opts.extract {array} - prop names needed for interpolation
   * @param opts.required {array} - prop names that must be supplied
   * alternatively, supply one list of prop names as `opts` if all of the above are the same.
   */
  constructor(opts: {compare: string[]; extract?: string[]; required?: string[]});
  /**
   * Checks if two sets of props need transition in between
   * @param currentProps {object} - a list of viewport props
   * @param nextProps {object} - a list of viewport props
   * @returns {bool} - true if two props are equivalent
   */
  arePropsEqual(currentProps: Record<string, any>, nextProps: Record<string, any>): boolean;
  /**
   * Called before transition starts to validate/pre-process start and end props
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @returns {Object} {start, end} - start and end props to be passed
   *   to `interpolateProps`
   */
  initializeProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>
  ): {
    start: Record<string, any>;
    end: Record<string, any>;
  };
  /**
   * Returns viewport props in transition
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @param t {number} - a time factor between [0, 1]
   * @returns {object} - a list of interpolated viewport props
   */
  abstract interpolateProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>,
    t: number
  ): Record<string, any>;
  /**
   * Returns transition duration
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @returns {Number} - transition duration in milliseconds
   */
  getDuration(startProps: Record<string, any>, endProps: Record<string, any>): number;
  _checkRequiredProps(props: any): void;
}
// # sourceMappingURL=transition-interpolator.d.ts.map
