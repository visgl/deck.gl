// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = /* glsl */ `\
layout(std140) uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`;
export const binSorterUniforms = {
    name: 'binSorter',
    vs: uniformBlock,
    uniformTypes: {
        binIdRange: 'vec4<i32>',
        targetSize: 'vec2<i32>'
    }
};
//# sourceMappingURL=bin-sorter-uniforms.js.map