// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const glslUniformBlock = `\
layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`;
export const scatterplotUniforms = {
    name: 'scatterplot',
    vs: glslUniformBlock,
    fs: glslUniformBlock,
    source: '',
    uniformTypes: {
        radiusScale: 'f32',
        radiusMinPixels: 'f32',
        radiusMaxPixels: 'f32',
        lineWidthScale: 'f32',
        lineWidthMinPixels: 'f32',
        lineWidthMaxPixels: 'f32',
        stroked: 'f32',
        filled: 'f32',
        antialiasing: 'f32',
        billboard: 'f32',
        radiusUnits: 'i32',
        lineWidthUnits: 'i32'
    }
};
//# sourceMappingURL=scatterplot-layer-uniforms.js.map