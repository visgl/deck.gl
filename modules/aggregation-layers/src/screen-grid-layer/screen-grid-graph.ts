// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Device, type CommandEncoder} from '@luma.gl/core';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {Computation} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shaders';
import {GPUGraph, GPUGraphCompiler, gpuGraph} from '@luma.gl/graph/gpu-graph';
import type {CompiledGPUCommandGraph} from '@luma.gl/graph/gpu-graph';
import {
  GPUGroupAggregationOperation,
  aggregationOperationLowerings
} from '../common/aggregator/gpu-graph/aggregation-operations';

const assignmentSource = (binning: string) => `
@group(0) @binding(auto) var<storage, read> positions: array<f32>;
@group(0) @binding(auto) var<storage, read> positionsLow: array<f32>;
@group(0) @binding(auto) var<storage, read> weights: array<f32>;
@group(0) @binding(auto) var<storage, read_write> keys: array<u32>;
@group(0) @binding(auto) var<storage, read_write> contributions: array<f32>;
struct BinAssignment { id: vec2i, valid: bool };
${binning}
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
  keys[index] = 0xffffffffu;
  if (!bin.valid || any(bin.id < aggregation.binRange.xz) ||
      any(bin.id >= aggregation.binRange.yw)) { return; }
  let cell = vec2u(bin.id - aggregation.binRange.xz);
  keys[index] = cell.y * aggregation.counts.z + cell.x;
  contributions[index] = weights[aggregation.weightLayout0.x + index * aggregation.weightLayout0.y];
}`;

const packSource = `
struct Bin { count: u32, value: u32 };
@group(0) @binding(auto) var<storage, read> counts: array<u32>;
@group(0) @binding(auto) var<storage, read> statistics: array<f32>;
@group(0) @binding(auto) var<storage, read_write> bins: array<Bin>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * aggregation.dispatchWidth;
  if (index >= aggregation.counts.y) { return; }
  let value = statistics[index];
  bins[index] = Bin(counts[index], bitcast<u32>(value));
}`;

/** ScreenGrid's projection/packing adapter around generic graph reductions. @internal */
export class ScreenGridGraph {
  private readonly assign: Computation;
  private readonly pack: Computation;
  private compiled?: CompiledGPUCommandGraph;
  private shape = '';
  private buffers: Record<string, Buffer> = {};

  constructor(
    private readonly device: Device,
    binning: string,
    modules: [ShaderModule, ShaderModule, ShaderModule]
  ) {
    this.assign = new Computation(device, {
      id: 'aggregation-assign',
      source: assignmentSource(binning),
      modules
    });
    this.pack = new Computation(device, {
      id: 'aggregation-pack',
      source: packSource,
      modules: [modules[1]]
    });
  }

  setShaderModuleProps(props: Record<string, any>): void {
    this.assign.shaderInputs.setProps(props);
  }

  encode(
    encoder: CommandEncoder,
    settings: Record<string, any>,
    bindings: {positions: Buffer; positionsLow: Buffer; weights: Buffer; bins: Buffer}
  ): void {
    const [pointCount, binCount] = settings.counts;
    const operation = settings.operations[0];
    const shape = `${pointCount}/${binCount}/${operation}`;
    if (shape !== this.shape) {
      this.destroyGraph();
      const program = new GPUGraph({id: 'screen-grid-aggregation'});
      for (const [name, format, length] of [
        ['keys', 'uint32', pointCount],
        ['contributions', 'float32', pointCount],
        ['counts', 'uint32', binCount],
        ['statistics', 'float32', binCount]
      ] as const) {
        const buffer = this.device.createBuffer({
          byteLength: Math.max(4, length * 4),
          usage: Buffer.STORAGE | Buffer.COPY_DST
        });
        this.buffers[name] = buffer;
        if (name === 'keys' || name === 'contributions')
          program.addInput(name, gpuGraph.vector(format, {length}));
        else program.addState(name, gpuGraph.vector(format, {length}));
      }
      program.add(
        new GPUGroupAggregationOperation({keys: 'keys', output: 'counts', operation: 'count'})
      );
      if (operation !== 4)
        program.add(
          new GPUGroupAggregationOperation({
            keys: 'keys',
            values: 'contributions',
            output: 'statistics',
            // Reuse the shared row counts and finalizer for MEAN.
            operation: (['sum', 'sum', 'min', 'max'] as const)[operation]
          })
        );
      const vectors = Object.fromEntries(
        Object.entries(this.buffers).map(([name, buffer]) => [
          name,
          new GPUVector({
            type: 'buffer',
            ownsBuffer: false,
            name,
            buffer,
            format:
              name === 'keys' || name === 'counts' ? ('uint32' as const) : ('float32' as const),
            length: name === 'keys' || name === 'contributions' ? pointCount : binCount
          })
        ])
      );
      const compilation = new GPUGraphCompiler(this.device, aggregationOperationLowerings).compile(
        program,
        {vectors}
      );
      this.compiled = compilation.graph.compile();
      this.shape = shape;
    }
    this.assign.setBindings({
      positions: bindings.positions,
      positionsLow: bindings.positionsLow,
      weights: bindings.weights,
      keys: this.buffers.keys,
      contributions: this.buffers.contributions
    });
    this.dispatch(this.assign, encoder, settings, pointCount);
    this.compiled!.encode(encoder, {parameters: undefined});
    this.pack.setBindings({
      counts: this.buffers.counts,
      statistics: this.buffers.statistics,
      bins: bindings.bins
    });
    this.dispatch(this.pack, encoder, settings, binCount);
  }

  private dispatch(
    computation: Computation,
    encoder: CommandEncoder,
    settings: Record<string, any>,
    count: number
  ): void {
    if (!count) return;
    const groups = Math.ceil(count / 64);
    const width = Math.min(groups, this.device.limits.maxComputeWorkgroupsPerDimension);
    computation.shaderInputs.setProps({aggregation: {...settings, dispatchWidth: width * 64}});
    computation.predraw(encoder);
    const pass = encoder.beginComputePass();
    computation.dispatch(pass, width, Math.ceil(groups / width));
    pass.end();
  }

  private destroyGraph(): void {
    this.compiled?.destroy();
    this.compiled = undefined;
    for (const buffer of Object.values(this.buffers)) buffer.destroy();
    this.buffers = {};
    this.shape = '';
  }

  destroy(): void {
    this.destroyGraph();
    this.assign.destroy();
    this.pack.destroy();
  }
}
