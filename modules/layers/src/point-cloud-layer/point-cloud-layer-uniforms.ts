// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';

const glslUniformBlock = `\
layout(std140) uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
  highp uint rowIndexOffset;
  float radiusMeters;
} pointCloud;
`;

export type PointCloudProps = {
  radiusPixels: number;
  sizeUnits: number;
  rowIndexOffset: number;
  radiusMeters: number;
};

export const pointCloudUniforms = {
  name: 'pointCloud',
  source: '',
  vs: glslUniformBlock,
  fs: glslUniformBlock,
  uniformTypes: {
    radiusPixels: 'f32',
    sizeUnits: 'i32',
    rowIndexOffset: 'u32',
    radiusMeters: 'f32'
  }
} as const satisfies ShaderModule<PointCloudProps>;
