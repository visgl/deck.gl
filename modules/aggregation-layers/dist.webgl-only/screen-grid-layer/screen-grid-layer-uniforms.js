// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = /* glsl */ `\
layout(std140) uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
  vec2 colorDomain;
} screenGrid;
`;
export const screenGridUniforms = {
    name: 'screenGrid',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    uniformTypes: {
        cellSizeClipspace: 'vec2<f32>',
        gridSizeClipspace: 'vec2<f32>',
        colorDomain: 'vec2<f32>'
    }
};
//# sourceMappingURL=screen-grid-layer-uniforms.js.map