// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = /* glsl */ `\
layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`;
export const binOptionsUniforms = {
    name: 'binOptions',
    vs: uniformBlock,
    uniformTypes: {
        cellOriginCommon: 'vec2<f32>',
        cellSizeCommon: 'vec2<f32>'
    }
};
//# sourceMappingURL=bin-options-uniforms.js.map