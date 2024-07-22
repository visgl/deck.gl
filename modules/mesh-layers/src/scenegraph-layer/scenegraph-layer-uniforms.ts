import type {Texture} from '@luma.gl/core';
import type {Matrix4} from '@math.gl/core';
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

export type ScenegraphProps = {
  sizeScale: number;
  sizeMinPixels: number;
  sizeMaxPixels: number;
  sceneModelMatrix: Matrix4;
  composeModelMatrix: boolean;
};

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
  } as const satisfies UniformTypes<ScenegraphProps>
} as const satisfies ShaderModule<ScenegraphProps>;
