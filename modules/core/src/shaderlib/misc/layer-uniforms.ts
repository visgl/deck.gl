import type {ShaderModule} from '@deck.gl/core';

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
