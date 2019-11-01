const EPSILON = 0.0001;

export function floatEquals(x, y) {
  return Math.abs(x - y) < EPSILON;
}

export function vecEquals(v1, v2) {
  for (let i = 0; i < v1.length; ++i) {
    if (!floatEquals(v1[i], v2[i])) {
      return false;
    }
  }

  return v1.length === v2.length;
}

export function vecNormalized(v) {
  for (let i = 0; i < v.length; ++i) {
    if (!Number.isFinite(v[i])) {
      return false;
    }
  }
  if (!floatEquals(v.len(), 1)) {
    return false;
  }

  return true;
}
