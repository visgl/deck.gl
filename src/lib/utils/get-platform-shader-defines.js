import {glGetDebugInfo} from 'luma.gl';

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

export function getPlatformShaderDefines(gl) {
  let platformDefines = '';
  const debugInfo = glGetDebugInfo(gl);

  if (checkRendererVendor(debugInfo, 'nvidia')) {
    platformDefines += '#define NVIDIA_GPU \n' +
    '#define NVIDIA_FP64_WA 1\n' +
    '#define NVIDIA_EQUATION_WA 1';
  } else if (checkRendererVendor(debugInfo, 'intel')) {
    platformDefines += '#define INTEL_GPU \n #define INTEL_FP64_WA 1\n #define INTEL_LOG_WA 1';
  } else if (checkRendererVendor(debugInfo, 'amd')) {
    platformDefines += '#define AMD_GPU \n';
  } else {
    platformDefines += '#define DEFAULT_GPU \n';
  }

  return platformDefines;
}
