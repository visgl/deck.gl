import {glGetDebugInfo} from 'luma.gl';

// Load shader chunks
// import SHADER_CHUNKS from '../../dist/shaderlib/shader-chunks';
import * as SHADER_CHUNKS from './shader-chunks';

export function checkRendererVendor(debugInfo, gpuVendor) {
  const {vendor, renderer} = debugInfo;
  let result;
  switch (gpuVendor) {
  case 'nvidia':
    result = vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i);
    break;
  case 'intel':
    result = vendor.match(/INTEL/i) || renderer.match(/INTEL/i);
    break;
  case 'amd':
    result =
      vendor.match(/AMD/i) || renderer.match(/AMD/i) ||
      vendor.match(/ATI/i) || renderer.match(/ATI/i);
    break;
  default:
    result = false;
  }
  return result;
}

export function getPlatformShaderDefines(gl) {
  /* eslint-disable */
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
#define INTEL_TAN_WORKAROUND 1
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

function assembleShader(gl, opts = {}) {
  const {vs, project = true, project64 = false} = opts;
  let {fp64 = false} = opts;
  if (project64 === true) {
    fp64 = true;
  }
  let source = `${getPlatformShaderDefines(gl)}\n`;
  opts = Object.assign({}, opts, {project, project64, fp64});
  for (const chunkName of Object.keys(SHADER_CHUNKS)) {
    if (opts[chunkName]) {
      source += `${SHADER_CHUNKS[chunkName].source}\n`;
    }
  }
  for (const chunkName of opts.modules || []) {
    if (SHADER_CHUNKS[chunkName]) {
      source += `${SHADER_CHUNKS[chunkName].source}\n`;
    } else {
      throw new Error(`Shader module ${chunkName} not found`);
    }
  }
  source += vs;
  return source;
}

export function assembleShaders(gl, opts) {
  return {
    gl,
    vs: assembleShader(gl, opts),
    fs: opts.fs
  };
}
