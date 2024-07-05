import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '@deck.gl/core';

const uniformBlock = `\
uniform sdfUniforms {
  float gamma;
  bool sdf;
  float sdfBuffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`;

export type SdfProps = {
  gamma: number;
  sdf: boolean;
  sdfBuffer: number;
  outlineBuffer: number;
  outlineColor: [number, number, number, number];
};

export const sdfUniforms = {
  name: 'sdf',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    gamma: 'f32',
    sdf: 'f32',
    sdfBuffer: 'f32',
    outlineBuffer: 'f32',
    outlineColor: 'vec4<f32>'
  } as const satisfies UniformTypes<Required<SdfProps>>
} as const satisfies ShaderModule<SdfProps>;
