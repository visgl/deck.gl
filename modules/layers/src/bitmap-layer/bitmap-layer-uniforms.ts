import type {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@deck.gl/core';

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
  }
} as const satisfies ShaderModule<BitmapProps>;

// Check type
type BitmapUniformProps = ShaderModule<BitmapProps>['uniformTypes'];
