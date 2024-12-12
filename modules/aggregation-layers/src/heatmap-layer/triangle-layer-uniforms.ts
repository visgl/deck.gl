// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`;

export type TriangleProps = {
  aggregationMode: number;
  colorDomain: [number, number];
  intensity: number;
  threshold: number;
  colorTexture: Texture;
  maxTexture: Texture;
  weightsTexture: Texture;
};

export const triangleUniforms = {
  name: 'triangle',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    aggregationMode: 'f32',
    colorDomain: 'vec2<f32>',
    intensity: 'f32',
    threshold: 'f32'
  }
} as const satisfies ShaderModule<TriangleProps>;
