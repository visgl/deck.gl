// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = `\
layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`;
export const solidPolygonUniforms = {
    name: 'solidPolygon',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        extruded: 'f32',
        isWireframe: 'f32',
        elevationScale: 'f32'
    }
};
//# sourceMappingURL=solid-polygon-layer-uniforms.js.map