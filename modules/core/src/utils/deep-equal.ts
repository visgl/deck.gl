// Partial deep equal (only recursive on arrays)
export function deepEqual(a: any, b: any, recurse: boolean = false): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (const key in a) {
    const aValue = a[key];
    const bValue = b[key];
    recurse = recurse || (Array.isArray(aValue) && Array.isArray(bValue));
    const equals = aValue === bValue || (recurse && deepEqual(aValue, bValue));
    if (!equals) {
      return false;
    }
  }
  return true;
}
