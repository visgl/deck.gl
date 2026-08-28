// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlockGLSL = `\
layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`;
export const pathUniforms = {
    name: 'path',
    source: uniformBlockWGSL,
    vs: uniformBlockGLSL,
    fs: uniformBlockGLSL,
    uniformTypes: {
        widthScale: 'f32',
        widthMinPixels: 'f32',
        widthMaxPixels: 'f32',
        jointType: 'f32',
        capType: 'f32',
        miterLimit: 'f32',
        billboard: 'f32',
        widthUnits: 'i32'
    }
};
//# sourceMappingURL=path-layer-uniforms.js.map