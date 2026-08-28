// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlockGLSL = `\
layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;
export const simpleMeshUniforms = {
    name: 'simpleMesh',
    source: uniformBlockWGSL,
    vs: uniformBlockGLSL,
    fs: uniformBlockGLSL,
    uniformTypes: {
        sizeScale: 'f32',
        composeModelMatrix: 'f32',
        hasTexture: 'f32',
        flatShading: 'f32'
    }
};
//# sourceMappingURL=simple-mesh-layer-uniforms.js.map