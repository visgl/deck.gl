// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const storage = `
struct Bin { count: atomic<u32>, value: atomic<u32> };
@group(0) @binding(auto) var<storage, read_write> bins: array<Bin>;
`;

export const initializeSource = `${storage}
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * aggregation.dispatchWidth;
  if (index >= aggregation.counts.y * aggregation.counts.w) { return; }
  let operation = aggregation.operations[index % aggregation.counts.w];
  atomicStore(&bins[index].count, 0u);
  var initial = 0.0;
  if (operation == 2u) { initial = 3.402823466e38; }
  if (operation == 3u) { initial = -3.402823466e38; }
  atomicStore(&bins[index].value, bitcast<u32>(initial));
}`;

/** Layer-provided getBin returns an integer ID and whether the point participates. */
export function getAggregateSource(channelCount: number, binning: string): string {
  const bindings = Array.from(
    {length: channelCount},
    (_, channel) => `@group(0) @binding(auto) var<storage, read> weights${channel}: array<f32>;`
  ).join('\n');
  const reductions = Array.from(
    {length: channelCount},
    (_, channel) => `
    reduce(binIndex * ${channelCount}u + ${channel}u, ${channel}u,
      weights${channel}[aggregation.weightLayout${channel}.x + index * aggregation.weightLayout${channel}.y]);`
  ).join('\n');
  return `${storage}
@group(0) @binding(auto) var<storage, read> positions: array<f32>;
@group(0) @binding(auto) var<storage, read> positionsLow: array<f32>;
${bindings}
struct BinAssignment { id: vec2i, valid: bool };
${binning}
fn reduce(index: u32, channel: u32, weight: f32) {
  atomicAdd(&bins[index].count, 1u);
  let operation = aggregation.operations[channel];
  if (operation == 4u) { return; }
  var old = atomicLoad(&bins[index].value);
  loop {
    let value = bitcast<f32>(old);
    var next = value + weight;
    if (operation == 2u) { next = min(value, weight); }
    if (operation == 3u) { next = max(value, weight); }
    let result = atomicCompareExchangeWeak(&bins[index].value, old, bitcast<u32>(next));
    if (result.exchanged) { break; }
    old = result.old_value;
  }
}
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * aggregation.dispatchWidth;
  if (index >= aggregation.counts.x) { return; }
  let p = aggregation.positionLayout.x + index * aggregation.positionLayout.y;
  var position = vec3f(positions[p], positions[p + 1u], 0.0);
  if (aggregation.positionLayout.z == 3u) { position.z = positions[p + 2u]; }
  let l = aggregation.lowLayout.x + index * aggregation.lowLayout.y;
  var low = vec3f(positionsLow[l], positionsLow[l + 1u], 0.0);
  if (aggregation.lowLayout.z == 3u) { low.z = positionsLow[l + 2u]; }
  let bin = getBin(position, low);
  let start = aggregation.binRange.xz;
  let end = aggregation.binRange.yw;
  if (!bin.valid || any(bin.id < start) || any(bin.id >= end)) { return; }
  let cell = vec2u(bin.id - start);
  let binIndex = cell.y * aggregation.counts.z + cell.x;
  ${reductions}
}`;
}

export const finalizeSource = `${storage}
@group(0) @binding(auto) var<storage, read_write> binIds: array<vec2f>;
@group(0) @binding(auto) var<storage, read_write> values: array<u32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * aggregation.dispatchWidth;
  if (index >= aggregation.counts.y) { return; }
  let cell = vec2i(i32(index % aggregation.counts.z), i32(index / aggregation.counts.z));
  binIds[index] = vec2f(cell + aggregation.binRange.xz);
  for (var channel = 0u; channel < aggregation.counts.w; channel++) {
    let offset = index * aggregation.counts.w + channel;
    let count = atomicLoad(&bins[offset].count);
    let operation = aggregation.operations[channel];
    var value = bitcast<f32>(atomicLoad(&bins[offset].value));
    if (count == 0u) { values[offset] = 0x7fc00000u; continue; }
    else if (operation == 4u) { value = f32(count); }
    else if (operation == 1u) { value /= f32(count); }
    values[offset] = bitcast<u32>(value);
  }
}`;
