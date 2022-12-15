/**
 * Fast partial deep equal for prop.
 *
 * @param a Prop
 * @param b Prop to compare against `a`
 * @param depth Depth to which to recurse in nested Objects/Arrays. Use 0 (default) for shallow comparison, -1 for infinite depth
 */
/* eslint-disable complexity */
export function deepEqual(a: any, b: any, depth: number): boolean {
  if (a === b) {
    return true;
  }
  if (
    !a ||
    !b ||
    Array.isArray(a) !== Array.isArray(b) ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    return false;
  }

  // Handle case where key in b is missing from a
  if (Array.isArray(b)) {
    if (b.length !== a.length) return false;
  } else {
    for (const key in b) {
      if (!(key in a)) return false;
    }
  }

  for (const key in a) {
    if (depth) {
      // Often will have shallow equality, so skip function invocation
      if (a[key] !== b[key] && !deepEqual(a[key], b[key], depth - 1)) {
        return false;
      }
    } else if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
