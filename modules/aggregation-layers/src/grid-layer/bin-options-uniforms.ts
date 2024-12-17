// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform binOptionsUniforms {
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
  uniformTypes: {
    cellOriginCommon: 'vec2<f32>',
    cellSizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<BinOptions>;
