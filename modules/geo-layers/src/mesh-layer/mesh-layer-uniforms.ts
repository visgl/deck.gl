// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
layout(std140) uniform meshUniforms {
  bool pickFeatureIds;
} mesh;
`;

const source = /* wgsl */ `\
struct MeshUniforms {
  pickFeatureIds: f32,
};

@group(0) @binding(auto) var<uniform> mesh: MeshUniforms;
`;

export type MeshProps = {
  pickFeatureIds: boolean;
};

export const meshUniforms = {
  name: 'mesh',
  vs: uniformBlock,
  fs: uniformBlock,
  source,
  uniformTypes: {
    pickFeatureIds: 'f32'
  }
} as const satisfies ShaderModule<MeshProps>;
