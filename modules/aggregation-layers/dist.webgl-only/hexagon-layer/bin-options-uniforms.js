// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = /* glsl */ `\
layout(std140) uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`;
export const binOptionsUniforms = {
    name: 'binOptions',
    vs: uniformBlock,
    uniformTypes: {
        hexOriginCommon: 'vec2<f32>',
        radiusCommon: 'f32'
    }
};
//# sourceMappingURL=bin-options-uniforms.js.map