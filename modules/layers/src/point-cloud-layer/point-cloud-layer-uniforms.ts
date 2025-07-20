// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const wgslUniformBlock = /* wgsl */ `\
struct PointCloudUniforms {
  radiusPixels: f32,
  sizeUnits: i32,
};

@group(0) @binding(3)
var<uniform> pointCloud: PointCloudUniforms;
`;

const glslUniformBlock = `\
uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
} pointCloud;
`;

export type PointCloudProps = {
  radiusPixels: number;
  sizeUnits: number;
};

export const pointCloudUniforms = {
  name: 'pointCloud',
  source: wgslUniformBlock,
  vs: glslUniformBlock,
  fs: glslUniformBlock,
  uniformTypes: {
    radiusPixels: 'f32',
    sizeUnits: 'i32'
  }
} as const satisfies ShaderModule<PointCloudProps>;
