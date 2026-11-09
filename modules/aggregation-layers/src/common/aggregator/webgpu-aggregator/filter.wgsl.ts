// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getAggregateSource} from './reduce.wgsl';

/** Raster execution of extension hooks before the same atomic bin reduction. */
export function getFilterSource(names: readonly string[], binning: string): string {
  const reduction = getAggregateSource(names.length, binning)
    .split('@compute')[0]
    .replace(
      /@group\(0\) @binding\(auto\) var<storage, read> (positions|positionsLow|weights\d+): array<f32>;/g,
      ''
    );
  return `${reduction}
struct Attributes {
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3f,
  @location(1) positions64Low: vec3f,
  ${names.map((name, i) => `@location(${i + 2}) ${name}: f32,`).join('\n')}
};
struct Varyings {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat) binId: vec2i,
  @location(1) @interpolate(flat) valid: u32,
  @location(2) weights: vec4f,
};
@vertex fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;
  geometry.worldPosition = attributes.positions;
  geometry.position = vec4f(project_position_vec3_f64(attributes.positions, attributes.positions64Low), 1.0);
  geometry.uv = vec2f(0.0);
  var clip = project_common_position_to_clipspace(geometry.position);
  DECKGL_FILTER_GL_POSITION(&clip, geometry);
  let bin = getBin(attributes.positions, attributes.positions64Low);
  varyings.binId = bin.id;
  varyings.valid = select(0u, 1u, bin.valid);
  varyings.weights = vec4f(${[0, 1, 2, 3].map(i => (names[i] ? `attributes.${names[i]}` : '1.0')).join(', ')});
  let corners = array<vec2f, 6>(vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0), vec2f(-1.0,1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0));
  varyings.position = vec4f(corners[attributes.vertexIndex], 0.0, 1.0);
  return varyings;
}
@fragment fn fragmentMain(varyings: Varyings) -> @location(0) vec4f {
  if (varyings.valid == 0u || any(varyings.binId < aggregation.binRange.xz) || any(varyings.binId >= aggregation.binRange.yw)) {return vec4f(0.0);}
  fragmentGeometry.uv = vec2f(0.0);
  var color = varyings.weights;
  DECKGL_FILTER_COLOR(&color, fragmentGeometry);
  let cell = vec2u(varyings.binId - aggregation.binRange.xz);
  let index = cell.y * aggregation.counts.z + cell.x;
  ${names.map((_, i) => `reduce(index * ${names.length}u + ${i}u, ${i}u, color[${i}]);`).join('\n')}
  return vec4f(0.0);
}`;
}
