// Linear scale maps continuous domain to continuous range
export function linearScale(domain, range, value) {

  return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
}

// Quantize scale is similar to linear scales,
// except it uses a discrete rather than continuous range
export function quantizeScale(domain, range, value) {
  const step = (domain[1] - domain[0]) / range.length;
  const idx = Math.floor((value - domain[0]) / step);
  const clampIdx = Math.max(Math.min(idx, range.length - 1), 0);

  return range[clampIdx];
}

export function clamp([min, max], value) {
  return Math.min(max, Math.max(min, value));
}
