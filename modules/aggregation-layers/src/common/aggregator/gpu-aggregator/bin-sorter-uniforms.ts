// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NumberArray2, NumberArray4} from '@math.gl/core';
import {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`;

export type BinSorterProps = {
  binIdRange: NumberArray4;
  targetSize: NumberArray2;
};

export const binSorterUniforms = {
  name: 'binSorter',
  vs: uniformBlock,
  uniformTypes: {
    binIdRange: 'vec4<i32>',
    targetSize: 'vec2<i32>'
  }
} as const satisfies ShaderModule<BinSorterProps>;
