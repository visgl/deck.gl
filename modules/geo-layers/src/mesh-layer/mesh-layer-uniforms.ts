import type {ShaderModule} from '@deck.gl/core';

const uniformBlock = `\
uniform meshUniforms {
  bool pickFeatureIds;
} mesh;
`;

export type MeshProps = {
  pickFeatureIds: boolean;
};

export const meshUniforms = {
  name: 'mesh',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    pickFeatureIds: 'f32'
  }
} as const satisfies ShaderModule<MeshProps>;
