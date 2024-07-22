import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '@deck.gl/core';

const uniformBlock = `\
uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;

export type SimplerMeshProps = {
  sizeScale: number;
  composeModelMatrix: boolean;
  hasTexture: boolean;
  flatShading: boolean;
};

export const simpleMeshUniforms = {
  name: 'simpleMesh',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    sizeScale: 'f32',
    composeModelMatrix: 'f32',
    hasTexture: 'f32',
    flatShading: 'f32'
  } as const satisfies UniformTypes<SimplerMeshProps>
} as const satisfies ShaderModule<SimplerMeshProps>;
