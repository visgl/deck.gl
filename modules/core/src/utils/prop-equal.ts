/**
 * Fast partial deep equal for prop.
 *
 * @param a Prop
 * @param b Prop to compare against `a`
 * @param depth Depth to which to recurse in nested Objects/Arrays. Use 0 (default) for shallow comparison, -1 for infinite depth
 */
/* eslint-disable complexity */
export function propEqual(a: any, b: any, depth: number): boolean {
  if (a === b) {
    return true;
  }
  if (
    !a ||
    !b ||
    !(a.constructor === Array || a.constructor === Object) ||
    !(b.constructor === Array || b.constructor === Object)
  ) {
    return false;
  }

  for (const key in a) {
    if (depth) {
      // Often will have shallow equality, so skip function invocation
      if (a[key] !== b[key] && !propEqual(a[key], b[key], depth - 1)) {
        return false;
      }
    } else if (a[key] !== b[key]) {
      return false;
    }
  }

  // Handle case where key in b is missing from a
  if (Array.isArray(b)) {
    if (b.length !== a.length) return false;
  } else {
    for (const key in b) {
      if (!(key in a)) return false;
    }
  }

  return true;
}
