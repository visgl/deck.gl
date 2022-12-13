/**
 * Fast partial deep equal for Arrays/Objects.
 *
 * @param a Array/Object
 * @param b Array/Object to compare against `a`
 * @param recursive If true, perform recursive comparison on Objects. Otherwise, only recursive on Arrays.
 */
export function deepEqual(a: any, b: any, recursive?: boolean): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (const key in a) {
    const aValue = a[key];
    const bValue = b[key];
    const equals =
      aValue === bValue ||
      ((recursive || (Array.isArray(aValue) && Array.isArray(bValue))) &&
        deepEqual(aValue, bValue, recursive));
    if (!equals) {
      return false;
    }
  }
  return true;
}
