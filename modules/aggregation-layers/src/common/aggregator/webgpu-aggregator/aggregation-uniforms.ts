// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const aggregationUniforms = {
  name: 'aggregation',
  source: `struct AggregationUniforms {
    counts: vec4u,
    operations: vec4u,
    binRange: vec4i,
    positionLayout: vec4u,
    lowLayout: vec4u,
    weightLayout0: vec4u,
    weightLayout1: vec4u,
    weightLayout2: vec4u,
    dispatchWidth: u32,
  };
  @group(0) @binding(auto) var<uniform> aggregation: AggregationUniforms;`,
  uniformTypes: {
    counts: 'vec4<u32>',
    operations: 'vec4<u32>',
    binRange: 'vec4<i32>',
    positionLayout: 'vec4<u32>',
    lowLayout: 'vec4<u32>',
    weightLayout0: 'vec4<u32>',
    weightLayout1: 'vec4<u32>',
    weightLayout2: 'vec4<u32>',
    dispatchWidth: 'u32'
  }
} as const;
