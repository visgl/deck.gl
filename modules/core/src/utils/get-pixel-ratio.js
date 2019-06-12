/* global window */
export default function getPixelRatio(useDevicePixels) {
  return useDevicePixels && typeof window !== 'undefined' ? window.devicePixelRatio : 1;
}
