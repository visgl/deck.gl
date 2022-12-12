// Partial deep equal (only recursive on arrays)
export function deepEqual(a: any, b: any, recursive: boolean = false): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  for (const key of keys) {
    const aValue = a[key];
    const bValue = b[key];
    const recurse = recursive || (Array.isArray(aValue) && Array.isArray(bValue));
    const equals = aValue === bValue || (recurse && deepEqual(aValue, bValue));
    if (!equals) {
      return false;
    }
  }
  return true;
}
