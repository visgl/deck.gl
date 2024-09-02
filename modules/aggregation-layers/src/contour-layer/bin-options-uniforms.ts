import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform aggregatorUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} aggregator;
`;

export type AggregatorProps = {
  cellOriginCommon: [number, number];
  cellSizeCommon: [number, number];
};

export const aggregatorUniforms = {
  name: 'aggregator',
  vs: uniformBlock,
  uniformTypes: {
    cellOriginCommon: 'vec2<f32>',
    cellSizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<AggregatorProps>;
