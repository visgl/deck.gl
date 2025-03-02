// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
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
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    radiusPixels: 'f32',
    sizeUnits: 'i32'
  }
} as const satisfies ShaderModule<PointCloudProps>;
