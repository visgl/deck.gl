// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const glslUniformBlock = `\
layout(std140) uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
} pointCloud;
`;
export const pointCloudUniforms = {
    name: 'pointCloud',
    source: '',
    vs: glslUniformBlock,
    fs: glslUniformBlock,
    uniformTypes: {
        radiusPixels: 'f32',
        sizeUnits: 'i32'
    }
};
//# sourceMappingURL=point-cloud-layer-uniforms.js.map