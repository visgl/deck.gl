// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform hexagonUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
} hexagon;
`;

export type HexagonProps = {
  colorDomain: [number, number, number, number];
  colorRange: Texture;
  elevationDomain: [number, number, number, number];
  elevationRange: [number, number];
  originCommon: [number, number];
};

export const hexagonUniforms = {
  name: 'hexagon',
  vs: uniformBlock,
  uniformTypes: {
    colorDomain: 'vec4<f32>',
    elevationDomain: 'vec4<f32>',
    elevationRange: 'vec2<f32>',
    originCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<HexagonProps>;
