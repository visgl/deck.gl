import {ShaderUniformType} from '@luma.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';
const uniformBlock = `\
uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`;

type DefaultUniformTypes<PropsT extends {} = {}> = {
  [propName in keyof PropsT]: ShaderUniformType;
};

export type BitmapProps = {
  bounds?: [number, number, number, number];
  coordinateConversion?: number;
  desaturate?: number;
  tintColor?: [number, number, number];
  transparentColor?: [number, number, number, number];
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
  } as const satisfies DefaultUniformTypes<BitmapProps>
} as const satisfies ShaderModule<BitmapProps>;
