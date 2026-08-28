// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockGLSL = /* glsl */ `\
layout(std140) uniform lineUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float useShortestPath;
  highp int widthUnits;
} line;
`;
export const lineUniforms = {
    name: 'line',
    source: '',
    vs: uniformBlockGLSL,
    fs: uniformBlockGLSL,
    uniformTypes: {
        widthScale: 'f32',
        widthMinPixels: 'f32',
        widthMaxPixels: 'f32',
        useShortestPath: 'f32',
        widthUnits: 'i32'
    }
};
//# sourceMappingURL=line-layer-uniforms.js.map