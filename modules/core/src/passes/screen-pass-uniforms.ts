import type {TextureView} from '@luma.gl/core';
import {ShaderModule} from '../shaderlib/shader-module';

const uniformBlock = `\
uniform screenUniforms {
  vec2 texSize;
} screen;
`;

type ScreenProps = {
  texSrc: TextureView;
  texSize: [number, number];
};

export const screenUniforms = {
  name: 'screen',
  fs: uniformBlock,
  uniformTypes: {
    texSize: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenProps>;

type t = ShaderModule<ScreenProps>['uniformTypes'];
