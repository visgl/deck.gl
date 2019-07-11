export function getLinearInterpolation(minThreshold, maxThreshold, threshold) {
  if (maxThreshold - minThreshold === 0) {
    throw new Error(`Threshold values should not be same, ${minThreshold}, ${maxThreshold}`);
  }
  return (threshold - minThreshold) / (maxThreshold - minThreshold);
}
