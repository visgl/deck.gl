// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = /* glsl */ `\
layout(std140) uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`;
export const gridUniforms = {
    name: 'grid',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    uniformTypes: {
        colorDomain: 'vec4<f32>',
        elevationDomain: 'vec4<f32>',
        elevationRange: 'vec2<f32>',
        originCommon: 'vec2<f32>',
        sizeCommon: 'vec2<f32>'
    }
};
//# sourceMappingURL=grid-layer-uniforms.js.map