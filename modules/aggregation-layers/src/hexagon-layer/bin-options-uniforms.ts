// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';
import {NumberArray2} from '@math.gl/core';

const uniformBlock = /* glsl */ `\
layout(std140) uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`;

export type BinOptions = {
  hexOriginCommon: NumberArray2;
  radiusCommon: number;
};

export const binOptionsUniforms = {
  name: 'binOptions',
  vs: uniformBlock,
  source: `struct BinOptionsUniforms {hexOriginCommon: vec2f, radiusCommon: f32,};
  @group(0) @binding(auto) var<uniform> binOptions: BinOptionsUniforms;`,
  uniformTypes: {
    hexOriginCommon: 'vec2<f32>',
    radiusCommon: 'f32'
  }
} as const satisfies ShaderModule<BinOptions>;
