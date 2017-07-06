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
export function compareProps({oldProps, newProps, ignoreProps = {}, triggerName = 'props'} = {}) {
  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  // shallow equality => deep equality
  if (oldProps === newProps) {
    return null;
  }

  if (typeof newProps !== 'object' || newProps === null) {
    return `${triggerName} changed shallowly`;
  }

  if (typeof oldProps !== 'object' || oldProps === null) {
    return `${triggerName} changed shallowly`;
  }

  // Test if new props different from old props
  for (const key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return `${triggerName} ${key} dropped: ${oldProps[key]} -> (undefined)`;
      }

      const equals = newProps[key] && oldProps[key] && newProps[key].equals;
      if (equals && !equals.call(newProps[key], oldProps[key])) {
        return `${triggerName} ${key} changed deeply: ${oldProps[key]} -> ${newProps[key]}`;
      }

      if (!equals && oldProps[key] !== newProps[key]) {
        return `${triggerName} ${key} changed shallowly: ${oldProps[key]} -> ${newProps[key]}`;
      }
    }
  }

  // Test if any new props have been added
  for (const key in newProps) {
    if (!(key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(key)) {
        return `${triggerName} ${key} added: (undefined) -> ${newProps[key]}`;
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

  // Reverse shadowing
  // TODO - Rewrite to stop when mergedDefaultProps is available on parent?
  while (object) {
    const objectDefaultProps = getOwnProperty(object.constructor, 'defaultProps');
    Object.freeze(objectDefaultProps);
    if (objectDefaultProps) {
      mergedDefaultProps = Object.assign({}, objectDefaultProps, mergedDefaultProps);
    }
    object = Object.getPrototypeOf(object);
  }

  Object.freeze(mergedDefaultProps);

  // Store for quick lookup
  subClassConstructor.mergedDefaultProps = mergedDefaultProps;

  assert(mergeDefaultProps);
  return mergedDefaultProps;
}
