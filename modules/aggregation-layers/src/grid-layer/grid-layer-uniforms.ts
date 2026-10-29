// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct gridUniforms {
  colorDomain: vec4<f32>,
  elevationDomain: vec4<f32>,
  elevationRange: vec2<f32>,
  originCommon: vec2<f32>,
  sizeCommon: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> grid: gridUniforms;
@group(0) @binding(auto) var colorRange: texture_2d<f32>;
@group(0) @binding(auto) var colorRangeSampler: sampler;
`;

const uniformBlock = /* glsl */ `\
layout(std140) uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`;

export type GridProps = {
  colorDomain: Readonly<[number, number, number, number]>;
  colorRange: Texture;
  elevationDomain: Readonly<[number, number, number, number]>;
  elevationRange: Readonly<[number, number]>;
  originCommon: Readonly<[number, number]>;
  sizeCommon: Readonly<[number, number]>;
};

export const gridUniforms = {
  name: 'grid',
  source: uniformBlockWGSL,
  vs: uniformBlock,
  uniformTypes: {
    colorDomain: 'vec4<f32>',
    elevationDomain: 'vec4<f32>',
    elevationRange: 'vec2<f32>',
    originCommon: 'vec2<f32>',
    sizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<GridProps>;
