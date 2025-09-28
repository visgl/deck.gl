// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
  vec2 colorDomain;
} screenGrid;
`;

export type ScreenGridProps = {
  cellSizeClipspace: [number, number];
  gridSizeClipspace: [number, number];
  colorDomain: [number, number];
  colorRange: Texture;
};

export const screenGridUniforms = {
  name: 'screenGrid',
  vs: uniformBlock,
  uniformTypes: {
    cellSizeClipspace: 'vec2<f32>',
    gridSizeClipspace: 'vec2<f32>',
    colorDomain: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenGridProps>;
