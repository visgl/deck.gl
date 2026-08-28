// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlockGLSL = /* glsl */ `\
layout(std140) uniform scenegraphUniforms {
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  mat4 sceneModelMatrix;
  float composeModelMatrix;
} scenegraph;
`;
export const scenegraphUniforms = {
    name: 'scenegraph',
    source: uniformBlockWGSL,
    vs: uniformBlockGLSL,
    fs: uniformBlockGLSL,
    uniformTypes: {
        sizeScale: 'f32',
        sizeMinPixels: 'f32',
        sizeMaxPixels: 'f32',
        sceneModelMatrix: 'mat4x4<f32>',
        composeModelMatrix: 'f32'
    }
};
//# sourceMappingURL=scenegraph-layer-uniforms.js.map