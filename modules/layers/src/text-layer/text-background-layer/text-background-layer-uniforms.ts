import type {ShaderModule} from '@deck.gl/core';

const uniformBlock = `\
uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`;

export type TextBackgroundProps = {
  billboard: boolean;
  sizeScale: number;
  sizeMinPixels: number;
  sizeMaxPixels: number;
  padding: [number, number, number, number];
  sizeUnits: number;
  stroked: boolean;
};

export const textBackgroundUniforms = {
  name: 'textBackground',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    billboard: 'f32',
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    padding: 'vec4<f32>',
    sizeUnits: 'i32',
    stroked: 'f32'
  }
} as const satisfies ShaderModule<TextBackgroundProps>;
