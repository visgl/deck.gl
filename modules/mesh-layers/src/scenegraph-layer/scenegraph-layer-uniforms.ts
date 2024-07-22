import type {Texture} from '@luma.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '@deck.gl/core';

const uniformBlock = `\
uniform scenegraphUniforms {
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  mat4 sceneModelMatrix;
  bool composeModelMatrix;
} scenegraph;
`;

type ScenegraphBindingProps = {
  u_BaseColorSampler: Texture;
};

export type ScenegraphUniformProps = {
  sizeScale: number;
  sizeMinPixels: number;
  sizeMaxPixels: number;
  sceneModelMatrix: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];
  composeModelMatrix: boolean;
};

export type ScenegraphProps = ScenegraphBindingProps & ScenegraphUniformProps;

export const scenegraphUniforms = {
  name: 'scenegraph',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    sceneModelMatrix: 'mat4x4<f32>',
    composeModelMatrix: 'f32'
  } as const satisfies UniformTypes<ScenegraphUniformProps>
} as const satisfies ShaderModule<ScenegraphProps>;
