// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`;

export type GridProps = {
  colorDomain: [number, number, number, number];
  colorRange: Texture;
  elevationDomain: [number, number, number, number];
  elevationRange: [number, number];
  originCommon: [number, number];
  sizeCommon: [number, number];
};

export const gridUniforms = {
  name: 'grid',
  vs: uniformBlock,
  uniformTypes: {
    colorDomain: 'vec4<f32>',
    elevationDomain: 'vec4<f32>',
    elevationRange: 'vec2<f32>',
    originCommon: 'vec2<f32>',
    sizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<GridProps>;
