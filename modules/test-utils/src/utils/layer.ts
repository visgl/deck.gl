import {UniformValue} from '@luma.gl/core';
import {Layer} from '@deck.gl/core';

/**
 * Extract uniform values set for a Layer in the underlying UniformBlock store
 */
export function getLayerUniforms(layer: Layer): Record<string, UniformValue> {
  let uniforms = {};
  const uniformBlocks = layer.getModels()[0]._uniformStore.uniformBlocks.values();
  for (const block of uniformBlocks) {
    uniforms = {...uniforms, ...block.uniforms};
  }

  return uniforms;
}
