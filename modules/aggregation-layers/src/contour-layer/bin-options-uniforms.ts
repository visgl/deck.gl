// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';

const uniformBlock = /* glsl */ `\
layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`;

export type BinOptions = {
  cellOriginCommon: [number, number];
  cellSizeCommon: [number, number];
};

export const binOptionsUniforms = {
  name: 'binOptions',
  vs: uniformBlock,
  source: `struct BinOptionsUniforms {cellOriginCommon: vec2f, cellSizeCommon: vec2f,};
  @group(0) @binding(auto) var<uniform> binOptions: BinOptionsUniforms;`,
  uniformTypes: {
    cellOriginCommon: 'vec2<f32>',
    cellSizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<BinOptions>;
