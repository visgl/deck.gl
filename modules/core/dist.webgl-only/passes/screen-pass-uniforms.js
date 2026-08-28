// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = `\
layout(std140) uniform screenUniforms {
  vec2 texSize;
} screen;
`;
export const screenUniforms = {
    name: 'screen',
    fs: uniformBlock,
    uniformTypes: {
        texSize: 'vec2<f32>'
    }
};
//# sourceMappingURL=screen-pass-uniforms.js.map