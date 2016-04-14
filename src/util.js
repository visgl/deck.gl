// Enable classic JavaScript object maps to be used as data

export function addIterator(object) {
  if (isPlainObject(object) && !object[Symbol.iterator]) {
    object[Symbol.iterator] = function iterator() {
      return valueIterator(this);
    };
  }
}

function* valueIterator(obj) {
  for (const key of Object.keys(obj)) {
    if (obj.hasOwnProperty(key) && key !== Symbol.iterator) {
      yield obj[key];
    }
  }
}

function isPlainObject(o) {
  return o !== null && typeof o === 'object' && o.constructor === Object;
}

// Shallow compare
/* eslint-disable complexity */
export function areEqualShallow(a, b, {ignore = {}} = {}) {

  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || a === null ||
    typeof b !== 'object' || b === null) {
    return false;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (!(key in ignore) && (!(key in b) || a[key] !== b[key])) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in ignore) && (!(key in a))) {
      return false;
    }
  }
  return true;
}
