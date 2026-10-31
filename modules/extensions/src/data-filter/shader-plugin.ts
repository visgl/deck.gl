// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {picking} from '@deck.gl/core';
import type {DataFilterExtensionOptions} from './data-filter-extension';
import {dataFilter, dataFilter64} from './shader-module';

const source = /* wgsl */ `
struct DataFilterUniforms {
  useSoftMargin: i32,
  enabled: i32,
  transformSize: i32,
  transformColor: i32,
  min: vec4<f32>,
  softMin: vec4<f32>,
  softMax: vec4<f32>,
  max: vec4<f32>,
  min64High: vec4<f32>,
  max64High: vec4<f32>,
  categoryBitMask: vec4<u32>,
};
@group(2) @binding(auto) var<uniform> dataFilter: DataFilterUniforms;

fn dataFilter_numericWeight(valueFromMin: f32, valueFromMax: f32, channel: u32) -> f32 {
  var left = select(0.0, 1.0, valueFromMin >= dataFilter.min[channel]);
  var right = select(0.0, 1.0, valueFromMax <= dataFilter.max[channel]);
  if (dataFilter.useSoftMargin != 0) {
    // Do not evaluate smoothstep with equal or reversed edges.
    if (dataFilter.softMin[channel] > dataFilter.min[channel]) {
      left = smoothstep(dataFilter.min[channel], dataFilter.softMin[channel], valueFromMin);
    }
    if (dataFilter.max[channel] > dataFilter.softMax[channel]) {
      right = 1.0 - smoothstep(dataFilter.softMax[channel], dataFilter.max[channel], valueFromMax);
    }
  }
  return left * right;
}
`;

/** Build a portable filtering interface; deck.gl owns the corresponding attributes. */
export function createDataFilterPlugin(
  options: Required<DataFilterExtensionOptions>
): ShaderPlugin {
  const {filterSize, categorySize, fp64} = options;
  const baseModule = fp64 ? dataFilter64 : dataFilter;
  const vertexInputs: NonNullable<ShaderPlugin['vertexInputs']> = {};
  const component = (name: string, size: number, channel: number) =>
    size === 1 ? name : `${name}[${channel}]`;
  const initialization = ['dataFilter_value = 1.0;', 'if (dataFilter.enabled != 0) {'];
  if (filterSize) {
    const type = filterSize === 1 ? 'f32' : (`vec${filterSize}<f32>` as const);
    vertexInputs.filterValues = type;
    if (fp64) vertexInputs.filterValues64Low = type;
    for (let channel = 0; channel < filterSize; channel++) {
      const value = component('filterValues', filterSize, channel);
      const low = component('filterValues64Low', filterSize, channel);
      const fromMin = fp64 ? `(${value} - dataFilter.min64High[${channel}]) + ${low}` : value;
      const fromMax = fp64 ? `(${value} - dataFilter.max64High[${channel}]) + ${low}` : value;
      initialization.push(
        `dataFilter_value = min(dataFilter_value, dataFilter_numericWeight(${fromMin}, ${fromMax}, ${channel}u));`
      );
    }
  }
  if (categorySize) {
    vertexInputs.filterCategoryValues = categorySize === 1 ? 'u32' : `vec${categorySize}<u32>`;
    const limit = categorySize === 1 ? 128 : categorySize === 2 ? 64 : 32;
    for (let channel = 0; channel < categorySize; channel++) {
      const category = component('filterCategoryValues', categorySize, channel);
      initialization.push(`
if (${category} >= ${limit}u) {
  dataFilter_value = 0.0;
} else if (((dataFilter.categoryBitMask[${channel * (limit / 32)}u + ${category} / 32u] >> (${category} & 31u)) & 1u) == 0u) {
  dataFilter_value = 0.0;
}`);
    }
  }
  initialization.push('}');
  const inject = baseModule.inject!;
  return {
    name: 'data-filter',
    modules: [
      {
        ...baseModule,
        dependencies: [picking],
        inject: undefined,
        source,
        uniformTypes: baseModule.uniformTypesFromOptions(options)
      } as ShaderModule<any, any, any>
    ],
    vertexInputs,
    varyings: {dataFilter_value: {type: 'f32'}},
    glsl: {
      injections: [
        {target: 'vs:#main-start', injection: inject['vs:#main-start'] as string},
        {target: 'vs:#main-end', injection: inject['vs:#main-end'] as string},
        {target: 'vs:DECKGL_FILTER_SIZE', injection: inject['vs:DECKGL_FILTER_SIZE'] as string},
        {target: 'fs:DECKGL_FILTER_COLOR', injection: inject['fs:DECKGL_FILTER_COLOR'] as string}
      ]
    },
    wgsl: {
      injections: [
        {target: 'vs:#main-start', injection: initialization.join('\n')},
        {
          target: 'vs:DECKGL_FILTER_VERTEX_SIZE',
          injection: 'if (dataFilter.transformSize != 0) { *size *= dataFilter_value; }'
        },
        {
          target: 'fs:DECKGL_FILTER_FRAGMENT_COLOR',
          injection: `
if (dataFilter_value == 0.0) { discard; }
if (dataFilter.transformColor != 0 && picking.isActive == 0.0) { (*color).a *= dataFilter_value; }
`
        }
      ]
    }
  };
}
