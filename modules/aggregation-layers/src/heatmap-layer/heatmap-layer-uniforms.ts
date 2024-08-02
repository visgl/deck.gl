import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`;

export type MaxWeightProps = {
  textureSize: number;
};

export const maxWeightUniforms = {
  name: 'maxWeight',
  vs: uniformBlock,
  uniformTypes: {
    textureSize: 'f32'
  }
} as const satisfies ShaderModule<MaxWeightProps>;
