// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = `\
layout(std140) uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`;
export const triangleUniforms = {
    name: 'triangle',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        aggregationMode: 'f32',
        colorDomain: 'vec2<f32>',
        intensity: 'f32',
        threshold: 'f32'
    }
};
//# sourceMappingURL=triangle-layer-uniforms.js.map