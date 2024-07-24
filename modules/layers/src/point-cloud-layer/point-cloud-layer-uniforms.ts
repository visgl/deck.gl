import type {ShaderModule} from '@deck.gl/core';

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
