// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';

const uniformBlock = /* glsl */ `\
layout(std140) uniform binOptionsUniforms {
  float cellSizePixels;
} binOptions;
`;

export type BinOptions = {
  cellSizePixels: number;
};

export const binOptionsUniforms = {
  name: 'binOptions',
  vs: uniformBlock,
  source: `struct BinOptionsUniforms { cellSizePixels: f32, };
    @group(0) @binding(auto) var<uniform> binOptions: BinOptionsUniforms;`,
  uniformTypes: {
    cellSizePixels: 'f32'
  }
} as const satisfies ShaderModule<BinOptions>;
