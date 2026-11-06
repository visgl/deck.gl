// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {project32} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {
  GPUConstant,
  GPUVector,
  getGPUVectorData,
  getGPUVectorFormatInfo
} from '@luma.gl/graph/gpu-data';
import type {Aggregator, AggregationProps} from '../common/aggregator/aggregator';

const uniforms = {
  name: 'screenAggregation',
  source: `struct ScreenAggregationUniforms {
    counts: vec4u,
    positionLayout: vec4u,
    lowLayout: vec4u,
    weightLayout: vec4u,
    cellSize: f32,
    dispatchWidth: u32,
  };
  @group(0) @binding(auto) var<uniform> screenAggregation: ScreenAggregationUniforms;`,
  uniformTypes: {
    counts: 'vec4<u32>',
    positionLayout: 'vec4<u32>',
    lowLayout: 'vec4<u32>',
    weightLayout: 'vec4<u32>',
    cellSize: 'f32',
    dispatchWidth: 'u32'
  }
} as const;

const storage = `
struct Bin { count: atomic<u32>, value: atomic<u32> };
@group(0) @binding(auto) var<storage, read_write> bins: array<Bin>;
`;
const initializeSource = `${storage}
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * screenAggregation.dispatchWidth;
  if (index >= screenAggregation.counts.y) { return; }
  atomicStore(&bins[index].count, 0u);
  var initial = 0.0;
  if (screenAggregation.counts.w == 2u) { initial = 3.402823466e38; }
  if (screenAggregation.counts.w == 3u) { initial = -3.402823466e38; }
  atomicStore(&bins[index].value, bitcast<u32>(initial));
}`;
const aggregateSource = `${storage}
@group(0) @binding(auto) var<storage, read> positions: array<f32>;
@group(0) @binding(auto) var<storage, read> positionsLow: array<f32>;
@group(0) @binding(auto) var<storage, read> weights: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * screenAggregation.dispatchWidth;
  if (index >= screenAggregation.counts.x) { return; }
  let p = screenAggregation.positionLayout.x + index * screenAggregation.positionLayout.y;
  var position = vec3f(positions[p], positions[p + 1u], 0.0);
  if (screenAggregation.positionLayout.z == 3u) { position.z = positions[p + 2u]; }
  let l = screenAggregation.lowLayout.x + index * screenAggregation.lowLayout.y;
  var low = vec3f(positionsLow[l], positionsLow[l + 1u], 0.0);
  if (screenAggregation.lowLayout.z == 3u) { low.z = positionsLow[l + 2u]; }
  let clip = project_position_to_clipspace(position, low, vec3f(0.0));
  let viewport = project.viewportSize / project.devicePixelRatio;
  let pixel = vec2f(clip.x / clip.w + 1.0, 1.0 - clip.y / clip.w) * 0.5 * viewport;
  if (clip.w <= 0.0 || any(pixel < vec2f(0.0)) || any(pixel >= viewport)) { return; }
  let cell = vec2u(floor(pixel / screenAggregation.cellSize));
  let binIndex = cell.y * screenAggregation.counts.z + cell.x;
  if (binIndex >= screenAggregation.counts.y) { return; }
  let w = weights[screenAggregation.weightLayout.x + index * screenAggregation.weightLayout.y];
  atomicAdd(&bins[binIndex].count, 1u);
  if (screenAggregation.counts.w == 4u) { return; }
  var old = atomicLoad(&bins[binIndex].value);
  loop {
    let value = bitcast<f32>(old);
    var next = value + w;
    if (screenAggregation.counts.w == 2u) { next = min(value, w); }
    if (screenAggregation.counts.w == 3u) { next = max(value, w); }
    let result = atomicCompareExchangeWeak(&bins[binIndex].value, old, bitcast<u32>(next));
    if (result.exchanged) { break; }
    old = result.old_value;
  }
}`;
const finalizeSource = `${storage}
@group(0) @binding(auto) var<storage, read_write> binIds: array<vec2f>;
@group(0) @binding(auto) var<storage, read_write> values: array<u32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x + id.y * screenAggregation.dispatchWidth;
  if (index >= screenAggregation.counts.y) { return; }
  binIds[index] = vec2f(f32(index % screenAggregation.counts.z), f32(index / screenAggregation.counts.z));
  let count = atomicLoad(&bins[index].count);
  var value = bitcast<f32>(atomicLoad(&bins[index].value));
  if (count == 0u) { values[index] = 0x7fc00000u; return; }
  else if (screenAggregation.counts.w == 4u) { value = f32(count); }
  else if (screenAggregation.counts.w == 1u) { value /= f32(count); }
  values[index] = bitcast<u32>(value);
}`;

/** Screen-space compute aggregation with borrowed GPUVector outputs. @internal */
export class WebGPUScreenGridAggregator implements Aggregator {
  binCount = 0;
  private props: AggregationProps = {
    pointCount: 0,
    attributes: {},
    operations: ['SUM'],
    binOptions: {}
  };
  private dirty = true;
  private columns = 0;
  private bins: Buffer | null = null;
  private ids: GPUVector | null = null;
  private values: GPUVector | null = null;
  private readonly initializeBins: Computation;
  private readonly aggregate: Computation;
  private readonly finalizeBins: Computation;
  private readonly zero: Buffer;

  constructor(private readonly device: Device) {
    this.initializeBins = new Computation(device, {
      id: 'screen-grid-clear',
      source: initializeSource,
      modules: [uniforms]
    });
    this.aggregate = new Computation(device, {
      id: 'screen-grid-aggregate',
      source: aggregateSource,
      modules: [project32, uniforms]
    });
    this.finalizeBins = new Computation(device, {
      id: 'screen-grid-finalize',
      source: finalizeSource,
      modules: [uniforms]
    });
    this.zero = device.createBuffer({
      data: new Float32Array(3),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
  }

  setProps(props: Partial<AggregationProps>): void {
    if (props.attributes)
      props = {...props, attributes: {...this.props.attributes, ...props.attributes}};
    Object.assign(this.props, props);
    if (Object.keys(props).some(key => key !== 'shaderModuleProps')) this.dirty = true;
    if (props.shaderModuleProps) this.aggregate.shaderInputs.setProps(props.shaderModuleProps);
    const range = this.props.binIdRange;
    if (range) {
      this.columns = range[0][1] - range[0][0];
      const count = this.columns * (range[1][1] - range[1][0]);
      this.binCount = Number.isFinite(count) && count > 0 ? count : 0;
    }
  }

  setNeedsUpdate(): void {
    this.dirty = true;
  }

  update(): void {
    if (this.ids?.length === this.binCount) return;
    this.destroyOutputs();
    this.bins?.destroy();
    const usage = Buffer.STORAGE | Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST;
    this.bins = this.device.createBuffer({byteLength: Math.max(1, this.binCount) * 8, usage});
    this.ids = new GPUVector({
      type: 'buffer',
      name: 'binIds',
      format: 'float32x2',
      length: this.binCount,
      buffer: this.device.createBuffer({byteLength: Math.max(1, this.binCount) * 8, usage}),
      ownsBuffer: false
    });
    this.values = new GPUVector({
      type: 'buffer',
      name: 'values',
      format: 'float32',
      length: this.binCount,
      buffer: this.device.createBuffer({byteLength: Math.max(1, this.binCount) * 4, usage}),
      ownsBuffer: false
    });
  }

  preDraw(): void {
    if (!this.dirty) return;
    this.update();
    if (!this.binCount) {
      this.dirty = false;
      this.props.onUpdate?.({channel: 0});
      return;
    }
    // Aggregation runs before cell draws, which may already have an open render pass.
    const encoder = this.device.createCommandEncoder();
    const temporary: Buffer[] = [];
    const prepare = (column: GPUVector | GPUConstant | undefined, components: number) => {
      if (!column) return {buffer: this.zero, layout: [0, 0, components, 0]};
      if (!column.format) throw new Error('ScreenGrid aggregation requires typed columns');
      const info = getGPUVectorFormatInfo(column.format);
      if (info.type !== 'float32' || info.components !== components)
        throw new Error('ScreenGrid aggregation requires float32 columns');
      if (column instanceof GPUConstant) {
        const buffer = this.device.createBuffer({
          data: column.value,
          usage: Buffer.STORAGE | Buffer.COPY_DST
        });
        temporary.push(buffer);
        return {buffer, layout: [0, 0, components, 0]};
      }
      const data = getGPUVectorData(column);
      if (!(data.buffer instanceof Buffer))
        throw new Error('ScreenGrid aggregation requires concrete buffers');
      let buffer = data.buffer;
      if (!(buffer.usage & Buffer.STORAGE)) {
        if (!(buffer.usage & Buffer.COPY_SRC))
          throw new Error('ScreenGrid inputs require STORAGE or COPY_SRC usage');
        const copy = this.device.createBuffer({
          byteLength: buffer.byteLength,
          usage: Buffer.STORAGE | Buffer.COPY_DST
        });
        encoder.copyBufferToBuffer({
          sourceBuffer: buffer,
          destinationBuffer: copy,
          size: buffer.byteLength
        });
        temporary.push(copy);
        buffer = copy;
      }
      return {buffer, layout: [data.byteOffset / 4, data.byteStride / 4, components, 0]};
    };
    try {
      const attributes = this.props.attributes;
      const positionColumns = attributes.positions?.getGPUVector() || {};
      const position = this.props.positions || positionColumns.positions;
      const components = position?.format === 'float32x2' ? 2 : 3;
      const p = prepare(position, components);
      const low = prepare(this.props.positions ? undefined : positionColumns.positions64Low, 3);
      const w = prepare(this.props.weights?.[0] || attributes.counts?.getGPUVector().counts, 1);
      const operation = ['SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'].indexOf(this.props.operations[0]);
      const settings = {
        counts: [this.props.pointCount, this.binCount, this.columns, operation],
        positionLayout: p.layout,
        lowLayout: low.layout,
        weightLayout: w.layout,
        cellSize: this.props.binOptions.cellSizePixels
      };
      this.initializeBins.setBindings({bins: this.bins!});
      this.aggregate.setBindings({
        bins: this.bins!,
        positions: p.buffer,
        positionsLow: low.buffer,
        weights: w.buffer
      });
      this.finalizeBins.setBindings({
        bins: this.bins!,
        binIds: getGPUVectorData(this.ids!).buffer,
        values: getGPUVectorData(this.values!).buffer
      });
      for (const [computation, count] of [
        [this.initializeBins, this.binCount],
        [this.aggregate, this.props.pointCount],
        [this.finalizeBins, this.binCount]
      ] as const) {
        const groups = Math.ceil(count / 64);
        const width = Math.min(groups, this.device.limits.maxComputeWorkgroupsPerDimension);
        computation.shaderInputs.setProps({
          screenAggregation: {...settings, dispatchWidth: width * 64}
        });
        computation.predraw(encoder);
        if (count) {
          const pass = encoder.beginComputePass();
          computation.dispatch(pass, width, Math.ceil(groups / width));
          pass.end();
        }
      }
      this.device.submit(encoder.finish());
    } finally {
      encoder.destroy();
      for (const buffer of temporary) buffer.destroy();
    }
    this.dirty = false;
    this.props.onUpdate?.({channel: 0});
  }

  getBins(): GPUVector | null {
    return this.ids;
  }
  getResult(channel: number): GPUVector | null {
    return channel === 0 ? this.values : null;
  }
  getResultDomain(): [number, number] {
    throw new Error('WebGPU ScreenGrid aggregation requires colorDomain');
  }
  getBin(): null {
    return null;
  }
  private destroyOutputs(): void {
    if (this.ids) getGPUVectorData(this.ids).buffer.destroy();
    if (this.values) getGPUVectorData(this.values).buffer.destroy();
    this.ids?.destroy();
    this.values?.destroy();
  }

  destroy(): void {
    this.initializeBins.destroy();
    this.aggregate.destroy();
    this.finalizeBins.destroy();
    this.destroyOutputs();
    this.bins?.destroy();
    this.zero.destroy();
  }
}
