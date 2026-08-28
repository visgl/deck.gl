// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = `\
layout(std140) uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`;
export const arcUniforms = {
    name: 'arc',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        greatCircle: 'f32',
        useShortestPath: 'f32',
        numSegments: 'f32',
        widthScale: 'f32',
        widthMinPixels: 'f32',
        widthMaxPixels: 'f32',
        widthUnits: 'i32'
    }
};
//# sourceMappingURL=arc-layer-uniforms.js.map