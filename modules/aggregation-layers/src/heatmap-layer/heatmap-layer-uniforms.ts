// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform weightUniforms {
  vec4 commonBounds;
  float radiusPixels;
  float textureWidth;
  float weightsScale;
} weight;
`;
export type WeightProps = {
  commonBounds: [number, number, number, number];
  radiusPixels: number;
  textureWidth: number;
  weightsScale: number;
  weightsTexture: Texture;
};

export const weightUniforms = {
  name: 'weight',
  vs: uniformBlock,
  uniformTypes: {
    commonBounds: 'vec4<f32>',
    radiusPixels: 'f32',
    textureWidth: 'f32',
    weightsScale: 'f32'
  }
} as const satisfies ShaderModule<WeightProps>;

export type MaxWeightProps = {
  inTexture: Texture;
  textureSize: number;
};

export const maxWeightUniforms = {
  name: 'maxWeight',
  vs: `\
uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`,
  uniformTypes: {
    textureSize: 'f32'
  }
} as const satisfies ShaderModule<MaxWeightProps>;
