import assert from 'assert';
import {mod} from '../math/utils';

const VIEWPORT_PROPS =
  ['width', 'height', 'longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

const ANGULAR_PROPS = {
  longitude: 1,
  bearing: 1
};

export function isValid(prop) {
  return Number.isFinite(prop) || Array.isArray(prop);
}

export function isAngularProp(propName) {
  return ANGULAR_PROPS[propName];
}

// TODO/xiaoji: This should be merged with the controller's prop constraint system
export function extractViewportFrom(props) {
  const viewport = {};
  VIEWPORT_PROPS.forEach((key) => {
    assert(isValid(props[key]));
    viewport[key] = props[key];
    // Normalize longitude and bearing into [-180, 180) range
    // This gurantees the props are in same range when they are interpolated.
    if (ANGULAR_PROPS[key]) {
      viewport[key] = mod(viewport[key] + 180, 360) - 180;
    }
  });
  return viewport;
}
