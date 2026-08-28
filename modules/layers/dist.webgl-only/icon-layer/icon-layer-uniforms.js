// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = `\
layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`;
export const iconUniforms = {
    name: 'icon',
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        sizeScale: 'f32',
        iconsTextureDim: 'vec2<f32>',
        sizeBasis: 'f32',
        sizeMinPixels: 'f32',
        sizeMaxPixels: 'f32',
        billboard: 'f32',
        sizeUnits: 'i32',
        alphaCutoff: 'f32'
    }
};
//# sourceMappingURL=icon-layer-uniforms.js.map