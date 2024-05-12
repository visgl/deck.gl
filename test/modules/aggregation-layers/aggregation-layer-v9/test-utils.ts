import {BinaryAttribute} from '@deck.gl/core';
import {luma} from '@luma.gl/core';

export function binaryAttributeToArray(accessor: BinaryAttribute, length: number): number[] {
  let value = accessor.value;
  if (!value) {
    const buffer = accessor.buffer;
    if (!buffer) {
      throw new Error('Invalid binary attribute');
    }
    value = new Float32Array(buffer.readSyncWebGL().buffer);
  }
  const size = accessor.size ?? 1;
  const offset = (accessor.offset ?? 0) / 4;
  const stride = accessor.stride ? accessor.stride / 4 : size!;
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < size; j++) {
      result[i * size + j] = value[i * stride + offset + j];
    }
  }
  return result;
}

export function getResourceCounts(): Record<string, number> {
  /* global luma */
  const resourceStats = luma.stats.get('Resource Counts');
  return {
    Framebuffer: resourceStats.get('Framebuffers Active').count,
    Texture2D: resourceStats.get('Texture2Ds Active').count,
    Buffer: resourceStats.get('Buffers Active').count,
    Shader: resourceStats.get('Shaders Active').count
  };
}
