// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type { ShaderModule } from '@luma.gl/shadertools';

export enum AlignToViewportMode {
  none = 0,
  start = 1,
  center = 2,
  end = 3,
}

const glslUniformBlock = `\
uniform clippingTextUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 scrollIntoView;
} clippingText;
`;

export type ClippingTextProps = {
  cutoffPixels: [number, number];
  scrollIntoView: [AlignToViewportMode, AlignToViewportMode];
};

export const clippingTextUniforms = {
  name: 'clippingText',
  vs: glslUniformBlock,
  fs: glslUniformBlock,
  uniformTypes: {
    cutoffPixels: 'vec2<f32>',
    scrollIntoView: 'vec2<i32>',
  },
} as const satisfies ShaderModule<ClippingTextProps>;
