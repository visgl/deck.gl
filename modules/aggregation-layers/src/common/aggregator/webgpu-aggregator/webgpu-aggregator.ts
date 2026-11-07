// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {project32} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shaders';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import type {Aggregator, AggregationProps} from '../aggregator';
import {AggregationColumnPreparation} from './column-preparation';
import {initializeSource, getAggregateSource, finalizeSource} from './reduce.wgsl';

/** Layer-specific bin assignment and input channel names for dense 2D reduction. */
type WebGPUAggregatorOptions = {
  channelNames: readonly string[];
  binning: string;
  binOptions: ShaderModule;
};

const aggregationUniforms = {
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

/** Shared dense-bin compute reduction. Layer adapters supply only bin assignment. @internal */
export class WebGPUAggregator implements Aggregator {
  /** Check declared binary storage before selecting a backend from stale attributes. */
  static supportsData(data: unknown, accessors: readonly string[]): boolean {
    const attributes = (data as {attributes?: Record<string, any>} | null)?.attributes;
    return accessors.every(name => {
      const column = attributes?.[name];
      const value = ArrayBuffer.isView(column) ? column : column?.value;
      if (value) return value instanceof Float32Array || value instanceof Float64Array;
      if (column?.format) return /^float32(x[23])?$/.test(column.format);
      if (column?.type) return ['float32', 'float64', 5126, 5130].includes(column.type);
      return true;
    });
  }

  /** Attribute-generated integer columns retain the sparse CPU fallback. */
  static supportsAttributes(
    attributes: AggregationProps['attributes'],
    weights: readonly string[]
  ): boolean {
    return (
      Object.values(attributes.positions?.getGPUVector() || {}).every(
        column => column.format === 'float32x2' || column.format === 'float32x3'
      ) &&
      weights.every(name =>
        Object.values(attributes[name]?.getGPUVector() || {}).every(
          column => column.format === 'float32'
        )
      )
    );
  }

  binCount = 0;
  private props: AggregationProps = {pointCount: 0, attributes: {}, operations: [], binOptions: {}};
  private dirty = true;
  private columns = 0;
  private bins: Buffer | null = null;
  private idBuffer: Buffer | null = null;
  private valueBuffer: Buffer | null = null;
  private ids: GPUVector | null = null;
  private results: GPUVector[] = [];
  private readonly initializeBins: Computation;
  private readonly aggregate: Computation;
  private readonly finalizeBins: Computation;
  private readonly zero: Buffer;

  constructor(
    private readonly device: Device,
    private readonly options: WebGPUAggregatorOptions
  ) {
    if (options.channelNames.length < 1 || options.channelNames.length > 3)
      throw new Error('Aggregation requires 1–3 channels');
    this.initializeBins = new Computation(device, {
      id: 'aggregation-clear',
      source: initializeSource,
      modules: [aggregationUniforms]
    });
    this.aggregate = new Computation(device, {
      id: 'aggregation-reduce',
      source: getAggregateSource(options.channelNames.length, options.binning),
      modules: [project32, aggregationUniforms, options.binOptions]
    });
    this.finalizeBins = new Computation(device, {
      id: 'aggregation-finalize',
      source: finalizeSource,
      modules: [aggregationUniforms]
    });
    this.zero = device.createBuffer({
      data: new Float32Array(3),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
  }

  setProps(props: Partial<AggregationProps>): void {
    for (const key in props) {
      if (key === 'attributes') {
        // Attribute objects are mutable; only the changed-attribute map signals new data.
        if (Object.keys(props.attributes!).length) this.dirty = true;
      } else if (key !== 'shaderModuleProps' && props[key] !== this.props[key]) {
        this.dirty = true;
      }
    }
    if (props.attributes)
      props = {...props, attributes: {...this.props.attributes, ...props.attributes}};
    Object.assign(this.props, props);
    if (props.shaderModuleProps) this.aggregate.shaderInputs.setProps(props.shaderModuleProps);
    if (props.binOptions)
      this.aggregate.shaderInputs.setProps({[this.options.binOptions.name]: props.binOptions});
    const range = this.props.binIdRange;
    if (range) {
      this.columns = range[0][1] - range[0][0];
      const rows = range[1][1] - range[1][0];
      const count = this.columns * rows;
      this.binCount = Number.isFinite(count) && this.columns > 0 && rows > 0 ? count : 0;
    }
  }

  setNeedsUpdate(): void {
    this.dirty = true;
  }

  update(): void {
    if (this.ids?.length === this.binCount) return;
    this.destroyOutputs();
    this.bins?.destroy();
    const channelCount = this.options.channelNames.length;
    const capacity = Math.max(1, this.binCount);
    const usage = Buffer.STORAGE | Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST;
    this.bins = this.device.createBuffer({
      byteLength: capacity * channelCount * 8,
      usage: Buffer.STORAGE
    });
    this.idBuffer = this.device.createBuffer({byteLength: capacity * 8, usage});
    this.valueBuffer = this.device.createBuffer({byteLength: capacity * channelCount * 4, usage});
    this.ids = new GPUVector({
      type: 'buffer',
      name: 'binIds',
      format: 'float32x2',
      length: this.binCount,
      buffer: this.idBuffer,
      ownsBuffer: false
    });
    this.results = this.options.channelNames.map(
      (name, channel) =>
        new GPUVector({
          type: 'buffer',
          name,
          format: 'float32',
          length: this.binCount,
          buffer: this.valueBuffer!,
          byteOffset: channel * 4,
          byteStride: channelCount * 4,
          ownsBuffer: false
        })
    );
  }

  preDraw(): void {
    if (!this.dirty) return;
    this.update();
    if (this.binCount) this.run();
    this.dirty = false;
    for (let channel = 0; channel < this.options.channelNames.length; channel++)
      this.props.onUpdate?.({channel});
  }

  private run(): void {
    // Use a separate encoder: the cell render pass may already be open.
    const encoder = this.device.createCommandEncoder();
    const columns = new AggregationColumnPreparation(this.device, encoder, this.zero);
    try {
      const {attributes} = this.props;
      const positionColumns = attributes.positions?.getGPUVector() || {};
      const position = this.props.positions || positionColumns.positions;
      const p = columns.prepare(position, position?.format === 'float32x2' ? 2 : 3);
      const low = columns.prepare(
        this.props.positions ? undefined : positionColumns.positions64Low,
        3
      );
      const weights = this.options.channelNames.map((name, channel) =>
        columns.prepare(this.props.weights?.[channel] || attributes[name]?.getGPUVector()[name], 1)
      );
      const operations = [0, 0, 0, 0];
      for (let channel = 0; channel < weights.length; channel++) {
        operations[channel] = ['SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'].indexOf(
          this.props.operations[channel] || 'SUM'
        );
      }
      const range = this.props.binIdRange!;
      const settings = {
        counts: [this.props.pointCount, this.binCount, this.columns, weights.length],
        operations,
        binRange: [...range[0], ...range[1]],
        positionLayout: p.layout,
        lowLayout: low.layout,
        ...Object.fromEntries(
          weights.map((weight, channel) => [`weightLayout${channel}`, weight.layout])
        )
      };
      this.initializeBins.setBindings({bins: this.bins!});
      this.aggregate.setBindings({
        bins: this.bins!,
        positions: p.buffer,
        positionsLow: low.buffer,
        ...Object.fromEntries(
          weights.map((weight, channel) => [`weights${channel}`, weight.buffer])
        )
      });
      this.finalizeBins.setBindings({
        bins: this.bins!,
        binIds: this.idBuffer!,
        values: this.valueBuffer!
      });
      for (const [computation, count] of [
        [this.initializeBins, this.binCount * weights.length],
        [this.aggregate, this.props.pointCount],
        [this.finalizeBins, this.binCount]
      ] as const) {
        const groups = Math.ceil(count / 64);
        const width = Math.min(groups, this.device.limits.maxComputeWorkgroupsPerDimension);
        computation.shaderInputs.setProps({aggregation: {...settings, dispatchWidth: width * 64}});
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
      columns.destroy();
    }
  }

  getBins(): GPUVector | null {
    return this.ids;
  }
  getResult(channel: number): GPUVector | null {
    return this.results[channel] || null;
  }
  getResultDomain(): [number, number] {
    throw new Error('Compute aggregation requires explicit domains');
  }
  getBin(): null {
    return null;
  }

  private destroyOutputs(): void {
    this.idBuffer?.destroy();
    this.valueBuffer?.destroy();
    this.ids?.destroy();
    for (const result of this.results) result.destroy();
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
