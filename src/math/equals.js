const EPSILON = 0.000001;

export function equals(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a === b) {
      return true;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; ++i) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
