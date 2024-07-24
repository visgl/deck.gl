import type {TextureView} from '@luma.gl/core';
import type {ShaderModule} from '../shaderlib/shader-module';

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
  texSize: [number, number, number, number];
};

export const screenUniforms = {
  name: 'screen',
  fs: uniformBlock,
  uniformTypes: {
    texSize: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenProps>;

type ResolvedUniformTypes = NonNullable<ShaderModule<ScreenProps>['uniformTypes']>;
type ResolvedUniformTypes2 = NonNullable<
  ShaderModule<ScreenProps, RenamedUniforms>['uniformTypes']
>;
type ResolvedBindings = NonNullable<ShaderModule<ScreenProps>['bindings']>;
