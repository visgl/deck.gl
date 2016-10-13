export function checkRendererVendor(debugInfo, vendor) {
  let result = false;
  switch (vendor) {
  case 'nvidia':
    result = debugInfo.vendor.match(/NVIDIA/i) || debugInfo.renderer.match(/NVIDIA/i);
    break;
  case 'intel':
    result = debugInfo.vendor.match(/INTEL/i) || debugInfo.renderer.match(/INTEL/i);
    break;
  case 'amd':
    result = debugInfo.vendor.match(/AMD/i) ||
    debugInfo.renderer.match(/AMD/i) ||
    debugInfo.vendor.match(/ATI/i) ||
    debugInfo.renderer.match(/ATI/i);
    break;
  default:
    result = false;
  }
  return result;
}
