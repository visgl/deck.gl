import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform gridUniforms {
  vec2 colorDomain;
  vec2 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`;

export type GridProps = {
  colorDomain: [number, number];
  colorRange: Texture;
  elevationDomain: [number, number];
  elevationRange: [number, number];
  originCommon: [number, number];
  sizeCommon: [number, number];
};

export const gridUniforms = {
  name: 'grid',
  vs: uniformBlock,
  uniformTypes: {
    colorDomain: 'vec2<f32>',
    elevationDomain: 'vec2<f32>',
    elevationRange: 'vec2<f32>',
    originCommon: 'vec2<f32>',
    sizeCommon: 'vec2<f32>'
  }
} as const satisfies ShaderModule<GridProps>;
