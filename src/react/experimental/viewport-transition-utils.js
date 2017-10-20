/* eslint max-statements: ["error", 50] */

import {projectFlat, unprojectFlat} from 'viewport-mercator-project';
import {Vector2} from 'math.gl';

const EPSILON = 0.01;
const VIEWPORT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch',
  'position', 'width', 'height'];
const VIEWPORT_INTERPOLATION_PROPS =
  ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'];

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

export function extractViewportFrom(props) {
  const viewport = {};
  VIEWPORT_PROPS.forEach((key) => {
    if (typeof props[key] !== 'undefined') {
      viewport[key] = props[key];
    }
  });
  return viewport;
}

/* eslint-disable max-depth */
export function areViewportsEqual(startViewport, endViewport) {
  for (const p of VIEWPORT_INTERPOLATION_PROPS) {
    if (Array.isArray(startViewport[p])) {
      for (let i = 0; i < startViewport[p].length; ++i) {
        if (startViewport[p][i] !== endViewport[p][i]) {
          return false;
        }
      }
    } else if (startViewport[p] !== endViewport[p]) {
      return false;
    }
  }
  return true;
}
/* eslint-enable max-depth */

/**
 * Performs linear interpolation of two viewports.
 * @param {Object} startViewport - object containing starting viewport parameters.
 * @param {Object} endViewport - object containing ending viewport parameters.
 * @param {Number} t - interpolation step.
 * @return {Object} - interpolated viewport for given step.
*/
export function viewportLinearInterpolator(startViewport, endViewport, t) {
  const viewport = {};

  for (const p of VIEWPORT_INTERPOLATION_PROPS) {
    const startValue = startViewport[p];
    const endValue = endViewport[p];
    // TODO: 'position' is not always specified
    if (typeof startValue !== 'undefined' && typeof endValue !== 'undefined') {
      viewport[p] = lerp(startValue, endValue, t);
    }
  }
  return viewport;
}

/**
 * This method adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
 *
 * @param {Object} startViewport - object containing starting viewport parameters.
 * @param {Object} endViewport - object containing ending viewport parameters.
 * @param {Number} t - interpolation step.
 * @return {Object} - interpolated viewport for given step.
*/
export function viewportFlyToInterpolator(startViewport, endViewport, t) {
  // Equations from above paper are referred where needed.

  const viewport = {};

  // TODO: add this as an option for applications.
  const rho = 1.414;

  const startZoom = startViewport.zoom;
  const startCenter = [startViewport.longitude, startViewport.latitude];
  const startScale = zoomToScale(startZoom);
  const endZoom = endViewport.zoom;
  const endCenter = [endViewport.longitude, endViewport.latitude];
  const scale = zoomToScale(endZoom - startZoom);

  const startCenterXY = new Vector2(projectFlat(startCenter, startScale));
  const endCenterXY = new Vector2(projectFlat(endCenter, startScale));
  const uDelta = endCenterXY.subtract(startCenterXY);

  const w0 = Math.max(startViewport.width, startViewport.height);
  const w1 = w0 / scale;
  const u1 = Math.sqrt((uDelta.x * uDelta.x) + (uDelta.y * uDelta.y));
  // u0 is treated as '0' in Eq (9).

  // Linearly interpolate 'bearing' and 'pitch'
  for (const p of ['bearing', 'pitch']) {
    const startValue = startViewport[p];
    const endValue = endViewport[p];
    viewport[p] = lerp(startValue, endValue, t);
  }

  // If change in center is too small, do linear interpolaiton.
  if (Math.abs(u1) < EPSILON) {
    for (const p of ['latitude', 'longitude', 'zoom']) {
      const startValue = startViewport[p];
      const endValue = endViewport[p];
      viewport[p] = lerp(startValue, endValue, t);
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
