// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform layerUniforms {
  uniform float opacity;
} layer;
`;

export type LayerProps = {
  opacity?: number;
};

export const layerUniforms = {
  name: 'layer',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    opacity: 'f32'
  }
} as const satisfies ShaderModule<LayerProps>;
