import type {Texture} from '@luma.gl/core';
import type {ShaderModule} from '@deck.gl/core';

const uniformBlock = `\
uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;

export type SimpleMeshProps = {
  sizeScale?: number;
  composeModelMatrix?: boolean;
  hasTexture?: boolean;
  flatShading?: boolean;
  sampler?: Texture;
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
  }
} as const satisfies ShaderModule<SimpleMeshProps>;
