import type {TextureView, UniformValue} from '@luma.gl/core';
import {ShaderModule} from '../shaderlib/shader-module';
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
type FilterUniformKeys<T> = {[K in keyof T]: T[K] extends UniformValue ? K : never}[keyof T];
type UniformsOnly<T> = {[K in FilterUniformKeys<T>]: T[K]};

type B = UniformsOnly<ScreenProps>;

export const screenUniforms = {
  name: 'screen',
  fs: uniformBlock,
  uniformTypes: {
    texSize: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenProps>;

type t = ShaderModule<ScreenProps>['uniformTypes'];
