import type {ShaderModule} from '@deck.gl/core';
import {Texture} from '@luma.gl/core';

const uniformBlock = `\
uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`;

type IconBindingProps = {
  iconsTexture: Texture;
};

type IconUniformProps = {
  sizeScale: number;
  iconsTextureDim: [number, number];
  sizeMinPixels: number;
  sizeMaxPixels: number;
  billboard: boolean;
  sizeUnits: number;
  alphaCutoff: number;
};

export type IconProps = IconBindingProps & IconUniformProps;

export const iconUniforms = {
  name: 'icon',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    sizeScale: 'f32',
    iconsTextureDim: 'vec2<f32>',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    billboard: 'f32',
    sizeUnits: 'i32',
    alphaCutoff: 'f32'
  }
} as const satisfies ShaderModule<IconProps>;
