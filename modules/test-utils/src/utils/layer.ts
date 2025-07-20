// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {UniformValue} from '@luma.gl/core';
import {Layer} from '@deck.gl/core';

/**
 * Extract uniform values set for a Layer in the underlying UniformBlock store
 */
export function getLayerUniforms(layer: Layer, blockName?: string): Record<string, UniformValue> {
  const uniforms = {};
  const uniformStore = layer.getModels()[0]._uniformStore;
  const uniformBlocks = blockName
    ? [uniformStore.uniformBlocks.get(blockName)]
    : uniformStore.uniformBlocks.values();
  for (const block of uniformBlocks) {
    Object.assign(uniforms, block!.uniforms);
  }

  return uniforms;
}
