// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `
struct BitmapUniforms {
  bounds: vec4<f32>,
  coordinateConversion: f32,
  desaturate: f32,
  tintColor: vec3<f32>,
  transparentColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> bitmap: BitmapUniforms;
@group(0) @binding(auto) var bitmapTexture: texture_2d<f32>;
@group(0) @binding(auto) var bitmapTextureSampler: sampler;
`;

const uniformBlockGLSL = `\
layout(std140) uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`;

export type BitmapProps = {
  bounds: [number, number, number, number];
  coordinateConversion: number;
  desaturate: number;
  tintColor: [number, number, number];
  transparentColor: [number, number, number, number];
  bitmapTexture: Texture;
};

export const bitmapUniforms = {
  name: 'bitmap',
  source: uniformBlockWGSL,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
  uniformTypes: {
    bounds: 'vec4<f32>',
    coordinateConversion: 'f32',
    desaturate: 'f32',
    tintColor: 'vec3<f32>',
    transparentColor: 'vec4<f32>'
  }
} as const satisfies ShaderModule<BitmapProps>;
