// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct triangleUniforms {
  aggregationMode: f32,
  colorDomain: vec2<f32>,
  intensity: f32,
  threshold: f32,
};

@group(0) @binding(auto) var<uniform> triangle: triangleUniforms;
@group(0) @binding(auto) var colorTexture: texture_2d<f32>;
@group(0) @binding(auto) var colorTextureSampler: sampler;
@group(0) @binding(auto) var maxTexture: texture_2d<f32>;
@group(0) @binding(auto) var weightsTexture: texture_2d<f32>;
@group(0) @binding(auto) var weightsTextureSampler: sampler;
`;

const uniformBlock = `\
layout(std140) uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`;

export type TriangleProps = {
  aggregationMode: number;
  colorDomain: Readonly<[number, number]>;
  intensity: number;
  threshold: number;
  colorTexture: Texture;
  maxTexture: Texture;
  weightsTexture: Texture;
};

export const triangleUniforms = {
  name: 'triangle',
  source: uniformBlockWGSL,
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    aggregationMode: 'f32',
    colorDomain: 'vec2<f32>',
    intensity: 'f32',
    threshold: 'f32'
  }
} as const satisfies ShaderModule<TriangleProps>;
