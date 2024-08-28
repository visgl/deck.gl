import {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
} screenGrid;
`;

export type ScreenGridProps = {
  cellSizeGridspace: [number, number];
  gridSizeGridspace: [number, number];
  colorDomain: [number, number];
  colorRange: Texture;
};

export const screenGridUniforms = {
  name: 'screenGrid',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    cellSizeGridspace: 'vec2<f32>',
    gridSizeGridspace: 'vec2<f32>',
    colorDomain: 'vec2<f32>'
  }
} as const satisfies ShaderModule<ScreenGridProps>;
