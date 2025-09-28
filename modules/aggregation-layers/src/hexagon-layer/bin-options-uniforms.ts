// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {NumberArray2} from '@math.gl/core';

const uniformBlock = /* glsl */ `\
uniform binOptionsUniforms {
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
  uniformTypes: {
    hexOriginCommon: 'vec2<f32>',
    radiusCommon: 'f32'
  }
} as const satisfies ShaderModule<BinOptions>;
