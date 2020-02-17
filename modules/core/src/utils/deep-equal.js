// Partial deep equal (only recursive on arrays)
export function deepEqual(a, b) {
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
      (Array.isArray(aValue) && Array.isArray(bValue) && deepEqual(aValue, bValue));
    if (!equals) {
      return false;
    }
  }
  return true;
}
