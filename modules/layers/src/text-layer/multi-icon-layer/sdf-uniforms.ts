// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`;

export type SdfProps = {
  gamma: number;
  enabled: boolean;
  buffer: number;
  outlineBuffer: number;
  outlineColor: [number, number, number, number];
};

export const sdfUniforms = {
  name: 'sdf',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    gamma: 'f32',
    enabled: 'f32',
    buffer: 'f32',
    outlineBuffer: 'f32',
    outlineColor: 'vec4<f32>'
  }
} as const satisfies ShaderModule<SdfProps>;
