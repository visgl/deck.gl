import type {Texture, UniformValue} from '@luma.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '@deck.gl/core';

const uniformBlock = `\
uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`;

export type BitmapProps = {
  bounds: [number, number, number, number];
  coordinateConversion: number;
  desaturate: number;
  tintColor: [number, number, number];
  transparentColor: [number, number, number, number];
  bitmapTexture: Texture;
};

type FilterUniformKeys<T> = {[K in keyof T]: T[K] extends UniformValue ? K : never}[keyof T];
type UniformsOnly<T> = {[K in FilterUniformKeys<T>]: T[K]};

export const bitmapUniforms = {
  name: 'bitmap',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    bounds: 'vec4<f32>',
    coordinateConversion: 'f32',
    desaturate: 'f32',
    tintColor: 'vec3<f32>',
    transparentColor: 'vec4<f32>'
  } as const satisfies UniformTypes<UniformsOnly<BitmapProps>>
} as const satisfies ShaderModule<BitmapProps>;

// Check type
type BitmapUniformProps = UniformsOnly<BitmapProps>;
