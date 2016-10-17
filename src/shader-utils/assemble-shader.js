import {glGetDebugInfo} from 'luma.gl';

// Load shader chunks
import SHADER_CHUNKS from '../../dist/shaderlib/shader-chunks';

function getPlatformPrologue(gl) {
  let defines = '';
  if (glGetDebugInfo(gl) !== null) {
    if (glGetDebugInfo(gl).vendor.match(/Intel/)) {
      defines += '#define INTEL_WORKAROUND 1\n';
    }
  }
  return defines;
}

export default function assembleShader(gl, {
  vs,
  projection = true,
  ...opts
}) {
  let source = `${getPlatformPrologue(gl)}\n`;
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
