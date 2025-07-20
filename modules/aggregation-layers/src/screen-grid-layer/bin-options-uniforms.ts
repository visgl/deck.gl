// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform binOptionsUniforms {
  float cellSizePixels;
} binOptions;
`;

export type BinOptions = {
  cellSizePixels: number;
};

export const binOptionsUniforms = {
  name: 'binOptions',
  vs: uniformBlock,
  uniformTypes: {
    cellSizePixels: 'f32'
  }
} as const satisfies ShaderModule<BinOptions>;
