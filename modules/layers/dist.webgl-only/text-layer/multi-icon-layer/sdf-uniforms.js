// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = `\
layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`;
export const sdfUniforms = {
    name: 'sdf',
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        gamma: 'f32',
        enabled: 'f32',
        buffer: 'f32',
        outlineBuffer: 'f32',
        outlineColor: 'vec4<f32>'
    }
};
//# sourceMappingURL=sdf-uniforms.js.map