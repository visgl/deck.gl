// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TextureView} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform screenUniforms {
  vec2 texSize;
} screen;
`;

export type ScreenProps = {
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
