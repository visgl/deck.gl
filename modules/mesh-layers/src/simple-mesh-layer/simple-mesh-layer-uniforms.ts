// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct SimpleMeshUniforms {
  sizeScale: f32,
  composeModelMatrix: f32,
  hasTexture: f32,
  flatShading: f32,
};

@group(0) @binding(auto) var<uniform> simpleMesh: SimpleMeshUniforms;
@group(0) @binding(auto) var simpleMeshTexture: texture_2d<f32>;
@group(0) @binding(auto) var simpleMeshTextureSampler: sampler;
`;

const uniformBlockGLSL = `\
layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;

export type SimpleMeshProps = {
  sizeScale?: number;
  composeModelMatrix?: boolean;
  hasTexture?: boolean;
  flatShading?: boolean;
  sampler?: Texture;
  simpleMeshTexture?: Texture;
};

export const simpleMeshUniforms = {
  name: 'simpleMesh',
  source: uniformBlockWGSL,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
  uniformTypes: {
    sizeScale: 'f32',
    composeModelMatrix: 'f32',
    hasTexture: 'f32',
    flatShading: 'f32'
  }
} as const satisfies ShaderModule<SimpleMeshProps>;
