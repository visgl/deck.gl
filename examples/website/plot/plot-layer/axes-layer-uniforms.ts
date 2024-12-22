// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform axesUniforms {
  float fontSize;
  vec3 gridCenter;
  vec3 gridDims;
  float gridOffset;
  float labelHeight;
  vec3 labelWidths;
  vec4 strokeColor;
} axes;
`;

export type AxesProps = {
  fontSize: number;
  gridCenter: [number, number, number];
  gridDims: [number, number, number];
  gridOffset: number;
  labelHeight: number;
  labelWidths: [number, number, number];
  strokeColor: [number, number, number, number];
  labelTexture: Texture;
};

export const axesUniforms = {
  name: 'axes',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    fontSize: 'f32',
    gridCenter: 'vec3<f32>',
    gridDims: 'vec3<f32>',
    gridOffset: 'f32',
    labelHeight: 'f32',
    labelWidths: 'vec3<f32>',
    strokeColor: 'vec4<f32>'
  }
} as const satisfies ShaderModule<AxesProps>;
