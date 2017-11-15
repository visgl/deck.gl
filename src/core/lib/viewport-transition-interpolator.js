import {projectFlat, unprojectFlat} from 'viewport-mercator-project';
import {Vector2, equals} from 'math.gl';
import assert from 'assert';

import {isValid, isAngularProp} from './viewport-transition-utils';

const EPSILON = 0.01;

const VIEWPORT_TRANSITION_PROPS =
  ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

/** Util functions */
function lerp(start, end, step) {
  if (Array.isArray(start)) {
    return start.map((element, index) => {
      return lerp(element, end[index], step);
    });
  }
  return step * end + (1 - step) * start;
}
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return Math.log2(scale);
}

export class ViewportTransitionInterpolator {

  /**
   * Checks if two sets of props need transition in between
   * @param currentProps {object} - a list of viewport props
   * @param nextProps {object} - a list of viewport props
   * @returns {bool} - true if two props are equivalent
   */
  arePropsEqual(currentProps, nextProps) {
    for (const key of VIEWPORT_TRANSITION_PROPS) {
      if (!equals(currentProps[key], nextProps[key])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns viewport props in transition
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @param t {number} - a time factor between [0, 1]
   * @returns {object} - a list of interpolated viewport props
   */
  interpolateProps(startProps, endProps, t) {
    // Dummy return value -- this should be overriden by child classes
    return endProps;
  }

}

/**
 * Performs linear interpolation of two viewports.
*/
export class ViewportLinearInterpolator extends ViewportTransitionInterpolator {

  /**
   * @param {Array} transitionProps - list of props to apply linear transition to.
   */
  constructor(transitionProps = VIEWPORT_TRANSITION_PROPS) {
    super();
    this.transitionProps = transitionProps;
  }

  arePropsEqual(currentProps, nextProps) {
    for (const key of this.transitionProps) {
      if (!equals(currentProps[key], nextProps[key])) {
        return false;
      }
    }
    return true;
  }

  interpolateProps(startProps, endProps, t) {
    const viewport = {};

    for (const key of this.transitionProps) {
      const startValue = startProps[key];
      let endValue = endProps[key];
      assert(isValid(startValue));
      assert(isValid(endValue));

      if (isAngularProp(key) && Math.abs(endValue - startValue) > 180) {
        endValue = (endValue < 0) ? endValue + 360 : endValue - 360;
      }

      viewport[key] = lerp(startValue, endValue, t);
    }
    return viewport;
  }

}

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
*/
export class ViewportFlyToInterpolator extends ViewportTransitionInterpolator {

  /* eslint-disable max-statements */
  interpolateProps(startProps, endProps, t) {
    // Equations from above paper are referred where needed.

    // Assert minimum required props
    for (const key of VIEWPORT_TRANSITION_PROPS) {
      assert(isValid(startProps[key]));
      assert(isValid(endProps[key]));
    }

    const viewport = {};

    // TODO: add this as an option for applications.
    const rho = 1.414;

    const startZoom = startProps.zoom;
    const startCenter = [startProps.longitude, startProps.latitude];
    const startScale = zoomToScale(startZoom);
    const endZoom = endProps.zoom;
    const endCenter = [endProps.longitude, endProps.latitude];
    const scale = zoomToScale(endZoom - startZoom);

    const startCenterXY = new Vector2(projectFlat(startCenter, startScale));
    const endCenterXY = new Vector2(projectFlat(endCenter, startScale));
    const uDelta = endCenterXY.subtract(startCenterXY);

    const w0 = Math.max(startProps.width, startProps.height);
    const w1 = w0 / scale;
    const u1 = Math.sqrt((uDelta.x * uDelta.x) + (uDelta.y * uDelta.y));
    // u0 is treated as '0' in Eq (9).

    // Linearly interpolate 'bearing' and 'pitch' if exist.
    for (const key of ['bearing', 'pitch']) {
      if (isValid(startProps[key])) {
        assert(isValid(endProps[key]));
        viewport[key] = lerp(startProps[key], endProps[key], t);
      }
    }

    // If change in center is too small, do linear interpolaiton.
    if (Math.abs(u1) < EPSILON) {
      for (const key of ['latitude', 'longitude', 'zoom']) {
        const startValue = startProps[key];
        const endValue = endProps[key];
        viewport[key] = lerp(startValue, endValue, t);
      }
      return viewport;
    }

    // Implement Equation (9) from above algorithm.
    const rho2 = rho * rho;
    const b0 = (w1 * w1 - w0 * w0 + rho2 * rho2 * u1 * u1) / (2 * w0 * rho2 * u1);
    const b1 = (w1 * w1 - w0 * w0 - rho2 * rho2 * u1 * u1) / (2 * w1 * rho2 * u1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    const S = (r1 - r0) / rho;
    const s = t * S;

    const w = (Math.cosh(r0) / Math.cosh(r0 + rho * s));
    const u = w0 * ((Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0)) / rho2) / u1;

    const scaleIncrement = 1 / w; // Using w method for scaling.
    const newZoom = startZoom + scaleToZoom(scaleIncrement);

    const newCenter = unprojectFlat(
      (startCenterXY.add(uDelta.scale(u))).scale(scaleIncrement),
      zoomToScale(newZoom));
    viewport.longitude = newCenter[0];
    viewport.latitude = newCenter[1];
    viewport.zoom = newZoom;
    return viewport;
  }
  /* eslint-enable max-statements */

}
