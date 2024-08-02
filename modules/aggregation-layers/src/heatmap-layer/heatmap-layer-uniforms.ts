import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`;

export type MaxWeightProps = {
  inTexture: Texture;
  textureSize: number;
};

export const maxWeightUniforms = {
  name: 'maxWeight',
  vs: uniformBlock,
  uniformTypes: {
    textureSize: 'f32'
  }
} as const satisfies ShaderModule<MaxWeightProps>;
