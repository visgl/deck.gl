import {Type} from './prop-types';
import {log} from './utils';
import assert from 'assert';

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * @param {Object} opt.oldProps - object with old key/value pairs
 * @param {Object} opt.newProps - object with new key/value pairs
 * @param {Object} opt.ignoreProps={} - object, keys that should not be compared
 * @returns {null|String} - null when values of all keys are strictly equal.
 *   if unequal, returns a string explaining what changed.
 */
/* eslint-disable max-statements, complexity */
export function compareProps({oldProps, newProps, ignoreProps = {}} = {}) {
  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  // props are immutable, so shallow equality => deep equality
  if (oldProps === newProps) {
    return null;
  }

  if (typeof newProps !== 'object' || newProps === null) {
    return 'new props is not an object';
  }

  if (typeof oldProps !== 'object' || oldProps === null) {
    return 'old props is not an object';
  }

  // Test if new props different from old props
  for (const key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return `prop ${key} dropped: ${oldProps[key]} -> (undefined)`;
      }

      const equals = newProps[key] && newProps[key].equals;
      if (equals && !equals.call(newProps[key], oldProps[key])) {
        return `prop ${key} changed deeply: ${oldProps[key]} -> ${newProps[key]}`;
      }

      if (!equals && oldProps[key] !== newProps[key]) {
        return `prop ${key} changed shallowly: ${oldProps[key]} -> ${newProps[key]}`;
      }
    }
  }

  // Test if any new props have been added
  for (const key in newProps) {
    if (!(key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(key)) {
        return `prop ${key} added: (undefined) -> ${newProps[key]}`;
      }
    }
  }

  return null;
}
/* eslint-enable max-statements, complexity */

// HELPERS

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return object.hasOwnProperty(prop) && object[prop];
}

// Helper to get the "PropTypes" from an object
function extractPropTypes(object) {
  const defaultProps = {};
  const propTypes = {};
  for (const key in object) {
    if (object[key] instanceof Type) {
      const type = object[key];
      defaultProps[key] = type.default;
      propTypes[key] = type;
    } else {
      defaultProps[key] = object[key];
    }
  }
  return {defaultProps, propTypes};
}

/*
 * Return merged default props stored on layers constructor, create them if needed
 */
export function getDefaultProps(layer) {
  const mergedDefaultProps = getOwnProperty(layer.constructor, 'mergedDefaultProps');
  if (mergedDefaultProps) {
    return mergedDefaultProps;
  }
  return mergeDefaultProps(layer);
}

/*
 * Walk a prototype chain and merge all default props from any 'defaultProps' objects
 */
export function mergeDefaultProps(object, objectNameKey = 'layerName') {
  const subClassConstructor = object.constructor;
  const objectName = getOwnProperty(subClassConstructor, objectNameKey);
  if (!objectName) {
    log.once(0, `${object.constructor.name} does not specify a ${objectNameKey}`);
  }

  // Use the object's constructor name as default id prop.
  // Note that constructor names are substituted during minification and may not be "human readable"
  let mergedDefaultProps = {
    id: objectName || object.constructor.name
  };
  let mergedPropTypes = {};

  // Reverse shadowing
  // TODO - Rewrite to stop when mergedDefaultProps is available on parent?
  while (object) {
    const objectDefaultProps = getOwnProperty(object.constructor, 'defaultProps');
    Object.freeze(objectDefaultProps);
    if (objectDefaultProps) {
      const {defaultProps, propTypes} = extractPropTypes(objectDefaultProps);
      mergedDefaultProps = Object.assign({}, defaultProps, mergedDefaultProps);
      mergedPropTypes = Object.assign({}, propTypes, mergedPropTypes);
    }
    object = Object.getPrototypeOf(object);
  }

  Object.freeze(mergedDefaultProps);
  Object.freeze(mergedPropTypes);

  // Store for quick lookup
  subClassConstructor.mergedDefaultProps = mergedDefaultProps;
  subClassConstructor.mergedPropTypes = mergedPropTypes;
  // Autogenerate propTypes
  subClassConstructor.propTypes = subClassConstructor.propTypes || mergedPropTypes;

  assert(mergeDefaultProps);
  return mergedDefaultProps;
}

// Animate properties (i.e. allow properties to be given as functions that
// are called on every render)
export function animateProperties(props, propTypes, animationParams) {
  // Animate any props mentioned in propTypes
  const animatedProps = {};
  for (const key in propTypes) {
    if (typeof props[key] === 'function') {
      animatedProps[key] = props[key](animationParams);
    }
  }

  // Animate setting overrides
  let settings = null;
  for (const key in props.settings) {
    if (typeof props.settings[key] === 'function') {
      settings = settings || {};
      settings[key] = props.settings[key](animationParams);
    }
  }

  // Animate uniform overrides
  let uniforms = null;
  for (const key in props.uniforms) {
    if (typeof props.key === 'function') {
      uniforms = uniforms || {};
      uniforms[key] = props.uniforms[key](animationParams);
    }
  }

  return Object.assign({}, props, animatedProps, {
    settings: settings ? Object.assign({}, props.settings, settings) : props.settings,
    uniforms: uniforms ? Object.assign({}, props.uniforms, uniforms) : props.uniforms
  });
}

