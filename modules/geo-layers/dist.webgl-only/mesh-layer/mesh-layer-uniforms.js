// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = `\
layout(std140) uniform meshUniforms {
  bool pickFeatureIds;
} mesh;
`;
const source = null;
export const meshUniforms = {
    name: 'mesh',
    vs: uniformBlock,
    fs: uniformBlock,
    source,
    uniformTypes: {
        pickFeatureIds: 'f32'
    }
};
//# sourceMappingURL=mesh-layer-uniforms.js.map