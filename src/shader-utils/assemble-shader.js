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
    platformDefines += `\
#define NVIDIA_GPU
#define NVIDIA_FP64_WORKAROUND 1
#define NVIDIA_EQUATION_WORKAROUND 1
`;
  } else if (checkRendererVendor(debugInfo, 'intel')) {
    platformDefines += `\
#define INTEL_GPU
#define INTEL_FP64_WORKAROUND 1
#define NVIDIA_EQUATION_WORKAROUND 1\n \
#define INTEL_LOG_WORKAROUND 1
`;
  } else if (checkRendererVendor(debugInfo, 'amd')) {
    platformDefines += `\
#define AMD_GPU
`;
  } else {
    platformDefines += `\
#define DEFAULT_GPU
`;
  }

  return platformDefines;
}

// Load shader chunks
import SHADER_CHUNKS from '../../dist/shaderlib/shader-chunks';

export default function assembleShader(gl, {
  vs,
  projection = true,
  ...opts
}) {
  let source = `${getPlatformShaderDefines(gl)}\n`;
  // Add predefined chunks
  if (projection) {
    source += `${SHADER_CHUNKS.projection}\n`;
  }
  for (const chunkName of Object.keys(SHADER_CHUNKS)) {
    if (opts[chunkName]) {
      source += `${SHADER_CHUNKS[chunkName]}\n`;
    }
  }
  source += vs;
  return source;
}
