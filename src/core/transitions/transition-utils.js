import {mod} from '../utils/math-utils';

const VIEWPORT_PROPS = [
  'width',
  'height',
  'longitude',
  'latitude',
  'zoom',
  'bearing',
  'pitch',
  'position'
];

const WRAPPED_ANGULAR_PROPS = {
  longitude: 1,
  bearing: 1
};

export function lerp(start, end, step) {
  if (Array.isArray(start)) {
    return start.map((element, index) => {
      return lerp(element, end[index], step);
    });
  }
  return step * end + (1 - step) * start;
}

export function isValid(prop) {
  return Number.isFinite(prop) || Array.isArray(prop);
}

function isWrappedAngularProp(propName) {
  return WRAPPED_ANGULAR_PROPS[propName];
}

export function getEndValueByShortestPath(propName, startValue, endValue) {
  if (isWrappedAngularProp(propName) && Math.abs(endValue - startValue) > 180) {
    endValue = endValue < 0 ? endValue + 360 : endValue - 360;
  }
  return endValue;
}

// TODO/xiaoji: This should be merged with the controller's prop constraint system
export function extractViewportFrom(props) {
  const viewport = {};
  VIEWPORT_PROPS.forEach(key => {
    const value = props[key];
    if (isValid(value)) {
      viewport[key] = value;
      // Normalize longitude and bearing into [-180, 180) range
      // This gurantees the props are in same range when they are interpolated.
      if (isWrappedAngularProp(key)) {
        viewport[key] = mod(value + 180, 360) - 180;
      }
    }
  });
  return viewport;
}
