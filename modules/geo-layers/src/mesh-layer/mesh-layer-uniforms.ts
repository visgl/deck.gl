// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

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
