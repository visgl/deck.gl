// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlockGLSL = `\
layout(std140) uniform tripsUniforms {
  bool fadeTrail;
  float trailLength;
  float currentTime;
} trips;
`;
export const tripsUniforms = {
    name: 'trips',
    source: uniformBlockWGSL,
    vs: uniformBlockGLSL,
    fs: uniformBlockGLSL,
    uniformTypes: {
        fadeTrail: 'f32',
        trailLength: 'f32',
        currentTime: 'f32'
    }
};
//# sourceMappingURL=trips-layer-uniforms.js.map