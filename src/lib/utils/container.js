// ES6 includes iteration and iterable protocols, and new standard containers
// Influential libraries like Immutable.js provide useful containers that
// adopt these conventions.
//
// So, is it possible to write generic JavaScript code that works with any
// well-written container class? And is it possible to write generic container
// classes that work with any well-written code.
//
// Almost. But it is not trivial. Importantly the standard JavaScript `Object`s
// lack even basic iteration support and even standard JavaScript `Array`s
// differ in minor but important aspects from the new classes.
//
// The bad news is that it does not appear that these things are going to be
// solved soon, even in an actively evolving language like JavaScript. The
// reason is concerns.
//
// The good news is that it is not overly hard to "paper over" the differences
// with a set of small efficient functions. And voila, container.js.
//
// Different types of containers provide different types of access.
// A random access container
// A keyed container

const ERR_NOT_CONTAINER = 'Expected a container';
const ERR_NOT_KEYED_CONTAINER = 'Expected a "keyed" container';

/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
export function isObject(value) {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if argument is a plain object (not a class or array etc)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a plain JavaScript object
 */
export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && value.constructor === Object;
}

export function isContainer(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) || isObject(value);
}

/**
 * Deduces numer of elements in a JavaScript container.
 * - Auto-deduction for ES6 containers that define a count() method
 * - Auto-deduction for ES6 containers that define a size member
 * - Auto-deduction for Classic Arrays via the built-in length attribute
 * - Also handles objects, although note that this an O(N) operation
 */
export function count(container) {
  // Check if ES6 collection "count" function is available
  if (typeof container.count === 'function') {
    return container.count();
  }

  // Check if ES6 collection "size" attribute is set
  if (Number.isFinite(container.size)) {
    return container.size;
  }

  // Check if array length attribute is set
  // Note: checking this last since some ES6 collections (Immutable.js)
  // emit profuse warnings when trying to access `length` attribute
  if (Number.isFinite(container.length)) {
    return container.length;
  }

  // Note that getting the count of an object is O(N)
  if (isPlainObject(container)) {
    let counter = 0;
    for (const key in container) { // eslint-disable-line
      counter++;
    }
    return counter;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// Returns an iterator over all **values** of a container
//
// Note: Keyed containers are expected to provide an `values()` method,
// with the exception of plain objects which get special handling

export function values(container) {
  // HACK - Needed to make buble compiler work
  if (Array.isArray(container)) {
    return container;
  }

  const prototype = Object.getPrototypeOf(container);
  if (typeof prototype.values === 'function') {
    return container.values();
  }

  if (typeof container.constructor.values === 'function') {
    return container.constructor.values(container);
  }

  const iterator = container[Symbol.iterator];
  if (iterator) {
    return container;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// /////////////////////////////////////////////////////////
// KEYED CONTAINERS
// Examples: objects, Map, Immutable.Map, ...

export function isKeyedContainer(container) {
  if (Array.isArray(container)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(container);
  // HACK to classify Immutable.List as non keyed container
  if (typeof prototype.shift === 'function') {
    return false;
  }
  const hasKeyedMethods = typeof prototype.get === 'function';
  return hasKeyedMethods || isPlainObject(container);
}

// Returns an iterator over all **entries** of a "keyed container"
// Keyed containers are expected to provide a `keys()` method,
// with the exception of plain objects.
//
export function keys(keyedContainer) {
  const prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.keys === 'function') {
    return keyedContainer.keys();
  }

  if (typeof keyedContainer.constructor.keys === 'function') {
    return keyedContainer.constructor.keys(keyedContainer);
  }

  throw new Error(ERR_NOT_KEYED_CONTAINER);
}

// Returns an iterator over all **entries** of a "keyed container"
//
// Keyed containers are expected to provide an `entries()` method,
// with the exception of plain objects.
//
export function entries(keyedContainer) {
  const prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.entries === 'function') {
    return keyedContainer.entries();
  }

  // if (typeof prototype.constructor.entries === 'function') {
  //   return prototype.constructor.entries(keyedContainer);
  // }

  if (typeof keyedContainer.constructor.entries === 'function') {
    return keyedContainer.constructor.entries(keyedContainer);
  }

  return null;
}

/**
 * Access properties of nested containers using dot-path notation
 * - Supports plain objects and arrays, as well as classes with `get` methods
 *   such as ES6 Maps, Immutable.js objects etc
 * - Returns undefined if any container is not valid, instead of throwing
 *
 * @param {Object} container - container that supports get
 * @param {String|*} compositeKey - key to access, can be '.'-separated string
 * @return {*} - value in the final key of the nested container
 */
export function get(container, compositeKey) {
  // Split the key into subkeys
  const keyList = getKeys(compositeKey);
  // Recursively get the value of each key;
  let value = container;
  for (const key of keyList) {
    // If any intermediate subfield is not a container, return undefined
    if (!isObject(value)) {
      return undefined;
    }
    // Get the `getter` for this container
    const getter = getGetter(value);
    // Use the getter to get the value for the key
    value = getter(value, key);
  }
  return value;
}

// Default getter is container indexing
const squareBracketGetter = (container, key) => container[key];
const getMethodGetter = (obj, key) => obj.get(key);
// Cache key to key arrays for speed
const keyMap = {};

// Looks for a `get` function on the prototype
// TODO - follow prototype chain?
// @private
// @return {Function} - get function: (container, key) => value
function getGetter(container) {
  // Check if container has a special get method
  const prototype = Object.getPrototypeOf(container);
  return prototype.get ? getMethodGetter : squareBracketGetter;
}

// Takes a string of '.' separated keys and returns an array of keys
// E.g. 'feature.geometry.type' => 'feature', 'geometry', 'type'
// @private
function getKeys(compositeKey) {
  if (typeof compositeKey === 'string') {
    // else assume string and split around dots
    let keyList = keyMap[compositeKey];
    if (!keyList) {
      keyList = compositeKey.split('.');
      keyMap[compositeKey] = keyList;
    }
    return keyList;
  }
  // Wrap in array if needed
  return Array.isArray(compositeKey) ? compositeKey : [compositeKey];
}

// "Generic" forEach that first attempts to call a
export function forEach(container, visitor) {
  // Hack to work around limitations in buble compiler
  const prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    container.forEach(visitor);
    return;
  }

  const isKeyed = isKeyedContainer(container);
  if (isKeyed) {
    for (const [key, value] of entries(container)) {
      visitor(value, key, container);
    }
    return;
  }

  let index = 0;
  for (const element of values(container)) {
    // result[index] = visitor(element, index, container);
    visitor(element, index, container);
    index++;
  }
}

export function map(container, visitor) {
  // Hack to work around limitations in buble compiler
  const prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    const result = [];
    container.forEach((x, i, e) => result.push(visitor(x, i, e)));
    return result;
  }

  const isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  const result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    for (const [key, value] of entries(container)) {
      // result[index] = visitor(element, index, container);
      result.push(visitor(value, key, container));
    }
  } else {
    let index = 0;
    for (const element of values(container)) {
      // result[index] = visitor(element, index, container);
      result.push(visitor(element, index, container));
      index++;
    }
  }
  return result;
}

export function reduce(container, visitor) {
  // Hack to work around limitations in buble compiler
  const prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    const result = [];
    container.forEach((x, i, e) => result.push(visitor(x, i, e)));
    return result;
  }

  const isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  const result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    for (const [key, value] of entries(container)) {
      // result[index] = visitor(element, index, container);
      result.push(visitor(value, key, container));
    }
  } else {
    let index = 0;
    for (const element of values(container)) {
      // result[index] = visitor(element, index, container);
      result.push(visitor(element, index, container));
      index++;
    }
  }
  return result;
}

// Attempt to create a simple (array, plain object) representation of
// a nested structure of ES6 iterable classes.
// Assumption is that if an entries() method is available, the iterable object
// should be represented as an object, if not as an array.
export function toJS(container) {
  if (!isObject(container)) {
    return container;
  }

  if (isKeyedContainer(container)) {
    const result = {};
    for (const [key, value] of entries(container)) {
      result[key] = toJS(value);
    }
    return result;
  }

  const result = [];
  for (const value of values(container)) {
    result.push(toJS(value));
  }
  return result;
}
