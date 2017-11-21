import assert from 'assert';
import TransitionInterpolator from './transition-interpolator';

import {Vector2} from 'math.gl';
import {projectFlat, unprojectFlat} from 'viewport-mercator-project';
import {isValid, lerp, getEndValueByShortestPath} from './transition-utils';

const EPSILON = 0.01;
const VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
const REQUIRED_PROPS = ['latitude', 'longitude', 'zoom', 'width', 'height'];
const LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];
const LINEARLY_INTERPOLATED_PROPS_ALT = ['latitude', 'longitude', 'zoom'];

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
*/
export default class ViewportFlyToInterpolator extends TransitionInterpolator {

  constructor() {
    super();
    this.propNames = VIEWPORT_TRANSITION_PROPS;
  }

  initializeProps(startProps, endProps) {
    const startViewportProps = {};
    const endViewportProps = {};

    // Check minimum required props
    for (const key of REQUIRED_PROPS) {
      const startValue = startProps[key];
      const endValue = endProps[key];
      assert(isValid(startValue) && isValid(endValue), `${key} must be supplied for transition`);
      startViewportProps[key] = startValue;
      endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
    }

    for (const key of LINEARLY_INTERPOLATED_PROPS) {
      const startValue = startProps[key] || 0;
      const endValue = endProps[key] || 0;
      startViewportProps[key] = startValue;
      endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
    }

    return {
      start: startViewportProps,
      end: endViewportProps
    };
  }

  interpolateProps(startProps, endProps, t) {
    return viewportFlyToInterpolator(startProps, endProps, t);
  }

}

/** Util functions */
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return Math.log2(scale);
}

/* eslint-disable max-statements */
function viewportFlyToInterpolator(startProps, endProps, t) {
  // Equations from above paper are referred where needed.

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
  for (const key of LINEARLY_INTERPOLATED_PROPS) {
    viewport[key] = lerp(startProps[key], endProps[key], t);
  }

  // If change in center is too small, do linear interpolaiton.
  if (Math.abs(u1) < EPSILON) {
    for (const key of LINEARLY_INTERPOLATED_PROPS_ALT) {
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
