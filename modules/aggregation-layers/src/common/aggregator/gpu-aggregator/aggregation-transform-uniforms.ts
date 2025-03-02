// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NumberArray3, NumberArray4} from '@math.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';
import {Texture} from '@luma.gl/core';

const uniformBlock = /* glsl */ `\
uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`;

export type AggregatorTransformProps = {
  binIdRange: NumberArray4;
  isCount: NumberArray3;
  isMean: NumberArray3;
  bins: Texture;
};

export const aggregatorTransformUniforms = {
  name: 'aggregatorTransform',
  vs: uniformBlock,
  uniformTypes: {
    binIdRange: 'vec4<i32>',
    isCount: 'vec3<f32>',
    isMean: 'vec3<f32>'
  }
} as const satisfies ShaderModule<AggregatorTransformProps>;
