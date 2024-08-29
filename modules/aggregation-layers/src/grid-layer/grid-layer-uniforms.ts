import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform gridUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
  vec2 colorDomain;
  vec2 elevationDomain;
  vec2 elevationRange;
} grid;
`;

export type GridProps = {
  cellOriginCommon: [number, number];
  cellSizeCommon: [number, number];
  colorDomain: [number, number];
  colorRange: Texture;
  elevationDomain: [number, number];
  elevationRange: [number, number];
};

export const gridUniforms = {
  name: 'grid',
  vs: uniformBlock,
  uniformTypes: {
    cellOriginCommon: 'vec2<f32>',
    cellSizeCommon: 'vec2<f32>',
    colorDomain: 'vec2<f32>',
    elevationDomain: 'vec2<f32>',
    elevationRange: 'vec2<f32>'
  }
} as const satisfies ShaderModule<GridProps>;
