// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = /* glsl */ `\
layout(std140) uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`;
export const aggregatorTransformUniforms = {
    name: 'aggregatorTransform',
    vs: uniformBlock,
    uniformTypes: {
        binIdRange: 'vec4<i32>',
        isCount: 'vec3<f32>',
        isMean: 'vec3<f32>',
        naN: 'f32'
    }
};
//# sourceMappingURL=aggregation-transform-uniforms.js.map