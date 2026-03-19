// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

export const AlignToViewportModes = {
  none: 0,
  start: 1,
  center: 2,
  end: 3
} as const;

const glslUniformBlock = `\
uniform clippingTextUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  bool flipY;
} clippingText;
`;

export type ClippingTextProps = {
  cutoffPixels: [number, number];
  align: [number, number];
  // If true, clipRect's x,y is the top-left corner instead of bottom-left
  flipY: boolean;
};

export const clippingTextUniforms = {
  name: 'clippingText',
  vs: glslUniformBlock,
  fs: glslUniformBlock,
  uniformTypes: {
    cutoffPixels: 'vec2<f32>',
    align: 'vec2<i32>',
    flipY: 'f32'
  }
} as const satisfies ShaderModule<ClippingTextProps>;
