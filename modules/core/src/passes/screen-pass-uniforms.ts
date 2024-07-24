import type {TextureView} from '@luma.gl/core';
import {ShaderModule} from '../shaderlib/shader-module';

const uniformBlock = `\
uniform screenUniforms {
  vec2 texSize;
} screen;
`;

export type ScreenProps = {
  texSrc: TextureView;
  texSize: [number, number];
};

type RenamedUniforms = {
  texSize: 'vec4<f32>';
};

export const screenUniforms = {
  name: 'screen',
  fs: uniformBlock,
  uniformTypes: {
    texSize: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenProps>;

type ResolvedUniformTypes = ShaderModule<ScreenProps>['uniformTypes'];
type ResolvedUniformTypes2 = ShaderModule<ScreenProps, RenamedUniforms>['uniformTypes'];
type ResolvedBindings = NonNullable<ShaderModule<ScreenProps>['bindings']>;
