// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = `\
layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`;
export const textBackgroundUniforms = {
    name: 'textBackground',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        billboard: 'f32',
        sizeScale: 'f32',
        sizeMinPixels: 'f32',
        sizeMaxPixels: 'f32',
        borderRadius: 'vec4<f32>',
        padding: 'vec4<f32>',
        sizeUnits: 'i32',
        stroked: 'f32'
    }
};
//# sourceMappingURL=text-background-layer-uniforms.js.map