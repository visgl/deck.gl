import type {TextureView} from '@luma.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '../shaderlib/misc/uniform-types';

const uniformBlock = `\
uniform screenUniforms {
  vec2 texSize;
} screen;
`;

type ScreenBindingProps = {
  texSrc: TextureView;
};

type ScreenUniformProps = {
  texSize: [number, number];
};

export type ScreenProps = ScreenBindingProps & ScreenUniformProps;

export const screenUniforms = {
  name: 'screen',
  fs: uniformBlock,
  uniformTypes: {
    texSize: 'vec2<f32>'
  } as const satisfies UniformTypes<Required<ScreenUniformProps>>
} as const satisfies ShaderModule<ScreenProps>;
