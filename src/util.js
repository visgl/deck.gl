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
  return typeof o === 'object' && o.constructor === Object;
}

// Shallow compare

export function areEqualShallow(a, b) {
  for (const key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
