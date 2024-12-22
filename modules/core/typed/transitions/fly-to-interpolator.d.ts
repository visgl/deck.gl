import TransitionInterpolator from './transition-interpolator';
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
  constructor(opts?: {
    /** The zooming "curve" that will occur along the flight path. Default 1.414 */
    curve?: number;
    /** The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa. Default 1.2 */
    speed?: number;
    /** The average speed of the animation measured in screenfuls per second. Similar to `opts.speed` it linearly affects the duration,  when specified `opts.speed` is ignored. */
    screenSpeed?: number;
    /** Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned. */
    maxDuration?: number;
  });
  interpolateProps(
    startProps: any,
    endProps: any,
    t: any
  ): {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  getDuration(startProps: any, endProps: any): any;
}
// # sourceMappingURL=fly-to-interpolator.d.ts.map
