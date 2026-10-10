// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Binding} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import type {GPUCommandGraph, GraphBufferUse, GraphDataView} from '@luma.gl/gpgpu/gpu-core';
import type {GPUGraphForceLayout} from '@luma.gl/gpgpu/gpu-graph';

const WORKGROUP_SIZE = 256;
const REPULSION_SAMPLE_COUNT = 4;

type SampledView = GraphDataView<'uint32'> | GraphDataView<'float32x2'>;
type SampledBinding = {view: SampledView; usage: GraphBufferUse['usage']};
type SampledState = {
  layout: GPUGraphForceLayout;
  vertexCount: number;
  positions: GraphDataView<'float32x2'>;
  velocities: GraphDataView<'float32x2'>;
  forwardOffsets: GraphDataView<'uint32'>;
  forwardNeighbors: GraphDataView<'uint32'>;
  overflow: GraphDataView<'uint32'>;
  reverseOffsets?: GraphDataView<'uint32'>;
  reverseNeighbors?: GraphDataView<'uint32'>;
  reverseOverflow?: GraphDataView<'uint32'>;
  pinned?: GraphDataView<'uint32'>;
  reset?: GraphDataView<'uint32'>;
};

/**
 * Adds real full-graph edge attraction and four deterministic long-range samples per vertex.
 *
 * Two globally synchronized passes preserve stable position snapshots and update every original
 * caller-owned position. The work is `O(E + 4V)`, never allocates scratch, submits, reads back,
 * repacks source rows, or uses floating-point atomics. Directed graphs consume both CSR views.
 */
export function addGraphExplorerSampledLayoutToGraph<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  layout: GPUGraphForceLayout
): void {
  const graph = layout.topology.graph;
  const reverse = graph.directed ? layout.topology.reverse : undefined;
  const state: SampledState = {
    layout,
    vertexCount: graph.vertexCount,
    positions: commandGraph.importGPUVector(`${layout.id}-sampled-positions`, layout.positions)
      .data[0],
    velocities: commandGraph.importGPUVector(`${layout.id}-sampled-velocities`, layout.velocities)
      .data[0],
    forwardOffsets: commandGraph.importGPUVector(
      `${layout.id}-sampled-forward-offsets`,
      layout.topology.forward.offsets
    ).data[0],
    forwardNeighbors: commandGraph.importGPUVector(
      `${layout.id}-sampled-forward-neighbors`,
      layout.topology.forward.neighbors
    ).data[0],
    overflow: commandGraph.importGPUVector(
      `${layout.id}-sampled-forward-overflow`,
      layout.topology.forward.overflow
    ).data[0],
    ...(reverse
      ? {
          reverseOffsets: commandGraph.importGPUVector(
            `${layout.id}-sampled-reverse-offsets`,
            reverse.offsets
          ).data[0],
          reverseNeighbors: commandGraph.importGPUVector(
            `${layout.id}-sampled-reverse-neighbors`,
            reverse.neighbors
          ).data[0],
          reverseOverflow: commandGraph.importGPUVector(
            `${layout.id}-sampled-reverse-overflow`,
            reverse.overflow
          ).data[0]
        }
      : {}),
    ...(layout.pinned
      ? {pinned: commandGraph.importGPUVector(`${layout.id}-sampled-pinned`, layout.pinned).data[0]}
      : {}),
    ...(layout.reset
      ? {reset: commandGraph.importGPUVector(`${layout.id}-sampled-reset`, layout.reset).data[0]}
      : {})
  };

  if (state.reset) {
    if (state.vertexCount > 0) addInitializationPass(commandGraph, state);
    addResetClearPass(commandGraph, state);
  }
  if (state.vertexCount === 0) return;

  for (let iteration = 0; iteration < layout.iterationsPerFrame; iteration++) {
    addSampledForcePass(commandGraph, state, iteration);
    addIntegrationPass(commandGraph, state, iteration);
  }
}

function addInitializationPass<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  state: SampledState
): void {
  const bindings: Record<string, SampledBinding> = {
    positions: {view: state.positions, usage: 'storage-read-write'},
    velocities: {view: state.velocities, usage: 'storage-write'},
    reset: {view: state.reset!, usage: 'storage-read'},
    overflow: {view: state.overflow, usage: 'storage-read'},
    ...(state.reverseOverflow
      ? {reverseOverflow: {view: state.reverseOverflow, usage: 'storage-read' as const}}
      : {}),
    ...(state.pinned ? {pinned: {view: state.pinned, usage: 'storage-read' as const}} : {})
  };
  const reverseInvalid = state.reverseOverflow
    ? ` || reverseOverflow[${getScalarOffset(state.reverseOverflow)}u] != 0u`
    : '';
  const pinned = state.pinned ? ` || pinned[${getScalarOffset(state.pinned)}u + index] != 0u` : '';
  const source = /* wgsl */ `
${getDeclarations(bindings)}
${getInvocationSource(commandGraph, state.vertexCount)}
${getCommunityAnchorSource(state.vertexCount, state.layout.seed)}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${state.vertexCount}u || reset[${getScalarOffset(state.reset!)}u] == 0u) { return; }
  let velocityIndex = ${getScalarOffset(state.velocities)}u + index * 2u;
  velocities[velocityIndex] = 0.0;
  velocities[velocityIndex + 1u] = 0.0;
  if (overflow[${getScalarOffset(state.overflow)}u] != 0u${reverseInvalid}${pinned}) { return; }
  let positionIndex = ${getScalarOffset(state.positions)}u + index * 2u;
  let anchor = getCommunityAnchor(index);
  positions[positionIndex] = anchor.x;
  positions[positionIndex + 1u] = anchor.y;
}`;
  addSampledPass(
    commandGraph,
    `${state.layout.id}-sampled-initialize`,
    source,
    bindings,
    state.vertexCount
  );
}

function addResetClearPass<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  state: SampledState
): void {
  const bindings: Record<string, SampledBinding> = {
    reset: {view: state.reset!, usage: 'storage-write'}
  };
  const source = /* wgsl */ `
${getDeclarations(bindings)}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  if (globalId.x == 0u) { reset[${getScalarOffset(state.reset!)}u] = 0u; }
}`;
  addSampledPass(commandGraph, `${state.layout.id}-sampled-clear-reset`, source, bindings, 1);
}

function addSampledForcePass<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  state: SampledState,
  iteration: number
): void {
  const bindings: Record<string, SampledBinding> = {
    positions: {view: state.positions, usage: 'storage-read'},
    velocities: {view: state.velocities, usage: 'storage-read-write'},
    forwardOffsets: {view: state.forwardOffsets, usage: 'storage-read'},
    forwardNeighbors: {view: state.forwardNeighbors, usage: 'storage-read'},
    overflow: {view: state.overflow, usage: 'storage-read'},
    ...(state.reverseOffsets && state.reverseNeighbors && state.reverseOverflow
      ? {
          reverseOffsets: {view: state.reverseOffsets, usage: 'storage-read' as const},
          reverseNeighbors: {view: state.reverseNeighbors, usage: 'storage-read' as const},
          reverseOverflow: {view: state.reverseOverflow, usage: 'storage-read' as const}
        }
      : {})
  };
  const reverseInvalid = state.reverseOverflow
    ? ` || reverseOverflow[${getScalarOffset(state.reverseOverflow)}u] != 0u`
    : '';
  const reverseAttraction =
    state.reverseOffsets && state.reverseNeighbors
      ? `
  let reverseFirst = min(reverseOffsets[${getScalarOffset(state.reverseOffsets)}u + index],
    ${state.reverseNeighbors.length}u);
  let reverseLast = min(reverseOffsets[${getScalarOffset(state.reverseOffsets)}u + index + 1u],
    ${state.reverseNeighbors.length}u);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let otherVertex = reverseNeighbors[${getScalarOffset(state.reverseNeighbors)}u + slot];
    if (otherVertex < ${state.vertexCount}u) {
      neighborDisplacement += readPosition(otherVertex) - position;
      neighborCount++;
    }
  }`
      : '';
  const source = /* wgsl */ `
${getDeclarations(bindings)}
${getInvocationSource(commandGraph, state.vertexCount)}
${getCommunityAnchorSource(state.vertexCount, state.layout.seed)}
fn readPosition(vertex: u32) -> vec2<f32> {
  let offset = ${getScalarOffset(state.positions)}u + vertex * 2u;
  return vec2<f32>(positions[offset], positions[offset + 1u]);
}
fn hash(value: u32) -> u32 {
  var result = value;
  result ^= result >> 16u;
  result *= 0x7feb352du;
  result ^= result >> 15u;
  result *= 0x846ca68bu;
  return result ^ (result >> 16u);
}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${state.vertexCount}u) { return; }
  let velocityIndex = ${getScalarOffset(state.velocities)}u + index * 2u;
  if (overflow[${getScalarOffset(state.overflow)}u] != 0u${reverseInvalid}) {
    velocities[velocityIndex] = 0.0;
    velocities[velocityIndex + 1u] = 0.0;
    return;
  }
  let position = readPosition(index);
  let anchor = getCommunityAnchor(index);
  var force = (anchor - position) * 0.12 - ${formatFloat(state.layout.gravity)} * position;
  for (var sampleIndex = 0u; sampleIndex < ${REPULSION_SAMPLE_COUNT}u; sampleIndex++) {
    let otherVertex = hash(index ^ (${state.layout.seed}u + sampleIndex * 0x9e3779b9u)) %
      ${state.vertexCount}u;
    if (otherVertex != index) {
      let difference = position - readPosition(otherVertex);
      force += ${formatFloat(state.layout.repulsion)} * difference /
        max(dot(difference, difference), 0.0001);
    }
  }
  let first = min(forwardOffsets[${getScalarOffset(state.forwardOffsets)}u + index],
    ${state.forwardNeighbors.length}u);
  let last = min(forwardOffsets[${getScalarOffset(state.forwardOffsets)}u + index + 1u],
    ${state.forwardNeighbors.length}u);
  var neighborDisplacement = vec2<f32>(0.0);
  var neighborCount = 0u;
  for (var slot = first; slot < last; slot++) {
    let otherVertex = forwardNeighbors[${getScalarOffset(state.forwardNeighbors)}u + slot];
    if (otherVertex < ${state.vertexCount}u) {
      neighborDisplacement += readPosition(otherVertex) - position;
      neighborCount++;
    }
  }
  ${reverseAttraction}
  force += ${formatFloat(state.layout.attraction)} * neighborDisplacement /
    max(f32(neighborCount), 1.0);
  var velocity =
    (vec2<f32>(velocities[velocityIndex], velocities[velocityIndex + 1u]) +
      force * ${formatFloat(state.layout.timeStep)}) * ${formatFloat(state.layout.damping)};
  let speed = length(velocity);
  if (speed > ${formatFloat(state.layout.maxVelocity)}) {
    velocity *= ${formatFloat(state.layout.maxVelocity)} / speed;
  }
  velocities[velocityIndex] = velocity.x;
  velocities[velocityIndex + 1u] = velocity.y;
}`;
  addSampledPass(
    commandGraph,
    `${state.layout.id}-sampled-force-${iteration}`,
    source,
    bindings,
    state.vertexCount
  );
}

function addIntegrationPass<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  state: SampledState,
  iteration: number
): void {
  const bindings: Record<string, SampledBinding> = {
    positions: {view: state.positions, usage: 'storage-read-write'},
    velocities: {view: state.velocities, usage: 'storage-read-write'},
    ...(state.pinned ? {pinned: {view: state.pinned, usage: 'storage-read' as const}} : {})
  };
  const pinnedGuard = state.pinned
    ? `
  if (pinned[${getScalarOffset(state.pinned)}u + index] != 0u) {
    velocities[velocityIndex] = 0.0;
    velocities[velocityIndex + 1u] = 0.0;
    return;
  }`
    : '';
  const source = /* wgsl */ `
${getDeclarations(bindings)}
${getInvocationSource(commandGraph, state.vertexCount)}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${state.vertexCount}u) { return; }
  let velocityIndex = ${getScalarOffset(state.velocities)}u + index * 2u;
  ${pinnedGuard}
  let positionIndex = ${getScalarOffset(state.positions)}u + index * 2u;
  positions[positionIndex] += velocities[velocityIndex] * ${formatFloat(state.layout.timeStep)};
  positions[positionIndex + 1u] += velocities[velocityIndex + 1u] *
    ${formatFloat(state.layout.timeStep)};
}`;
  addSampledPass(
    commandGraph,
    `${state.layout.id}-sampled-integrate-${iteration}`,
    source,
    bindings,
    state.vertexCount
  );
}

function addSampledPass<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  id: string,
  source: string,
  bindings: Record<string, SampledBinding>,
  count: number
): void {
  const dispatch = getDispatchLayout(commandGraph, count);
  commandGraph.addComputePass({
    id,
    resources: Object.values(bindings).map(({view, usage}) => ({buffer: view, usage})),
    compile: ({device}) => {
      const computation = new Computation(device, {
        id,
        source,
        shaderLayout: {
          bindings: Object.keys(bindings).map((name, location) => ({
            name,
            type: 'storage' as const,
            group: 0,
            location
          }))
        }
      });
      return {
        encode: ({computePass, getBuffer}) => {
          const buffers: Record<string, Binding> = {};
          for (const [name, binding] of Object.entries(bindings)) {
            buffers[name] = getBuffer(binding.view);
          }
          computation.setBindings(buffers);
          computation.dispatch(computePass, dispatch[0], dispatch[1], dispatch[2]);
        },
        destroy: () => computation.destroy()
      };
    }
  });
}

function getDeclarations(bindings: Record<string, SampledBinding>): string {
  return Object.entries(bindings)
    .map(([name, binding], index) => {
      const access = binding.usage === 'storage-read' ? 'read' : 'read_write';
      const type = binding.view.format === 'uint32' ? 'u32' : 'f32';
      return `@group(0) @binding(${index}) var<storage, ${access}> ${name}: array<${type}>;`;
    })
    .join('\n');
}

function getInvocationSource<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  count: number
): string {
  const dispatch = getDispatchLayout(commandGraph, count);
  return /* wgsl */ `
fn getInvocationIndex(workgroupId: vec3<u32>, localInvocationIndex: u32) -> u32 {
  return ((workgroupId.z * ${dispatch[1]}u + workgroupId.y) * ${dispatch[0]}u +
    workgroupId.x) * ${WORKGROUP_SIZE}u + localInvocationIndex;
}`;
}

/** Restores four deterministic sunflower communities instead of an unstable global point cloud. */
function getCommunityAnchorSource(vertexCount: number, seed: number): string {
  return /* wgsl */ `
fn getCommunityAnchor(vertex: u32) -> vec2<f32> {
  let community = min((vertex * 4u) / ${vertexCount}u, 3u);
  let first = (community * ${vertexCount}u) / 4u;
  let next = ((community + 1u) * ${vertexCount}u) / 4u;
  let localIndex = vertex - first;
  let population = max(next - first, 1u);
  let radius = sqrt((f32(localIndex) + 0.5) / f32(population)) * 0.38;
  let angle = f32(localIndex) * 2.39996323 + f32(${seed}u & 255u) * 0.003;
  let centerX = select(-0.52, 0.52, (community & 1u) != 0u);
  let centerY = select(-0.43, 0.43, community >= 2u);
  return vec2<f32>(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
}`;
}

function getDispatchLayout<Parameters>(
  commandGraph: GPUCommandGraph<Parameters>,
  count: number
): readonly [number, number, number] {
  const workgroups = Math.max(1, Math.ceil(count / WORKGROUP_SIZE));
  const limit = commandGraph.device.limits.maxComputeWorkgroupsPerDimension;
  const width = Math.min(workgroups, limit);
  const height = Math.min(Math.ceil(workgroups / width), limit);
  const depth = Math.ceil(workgroups / (width * height));
  if (depth > limit) throw new Error('Graph explorer sampled layout exceeds bounded GPU dispatch');
  return [width, height, depth];
}

function getScalarOffset(view: SampledView): number {
  return view.byteOffset / Uint32Array.BYTES_PER_ELEMENT;
}

function formatFloat(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : `${value}`;
}
