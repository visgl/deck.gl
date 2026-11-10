// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {project32, _GPUVectorModel as GPUVectorModel, _deepEqual as deepEqual} from '@deck.gl/core';
import {Buffer, type Device, type Texture, type Framebuffer} from '@luma.gl/core';
import {aggregationUniforms} from './aggregation-uniforms';
import {getFilterSource} from './filter.wgsl';
import {Computation, type ModelProps} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shaders';
import {GPUVector, GPUConstant, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import type {Aggregator, AggregationProps} from '../aggregator';
import {AggregationColumnPreparation} from './column-preparation';
import {initializeSource, getAggregateSource, finalizeSource} from './reduce.wgsl';

/** Layer-specific bin assignment and input channel names for dense 2D reduction. */
export type WebGPUAggregatorOptions = {
  shaders?: Pick<ModelProps, 'plugins' | 'shaderAssembler' | 'modules' | 'defines'>;
  requestRedraw?: () => void;
  bindAttributes?: (model: GPUVectorModel) => void;
  channelNames: readonly string[];
  binning: string;
  binOptions: ShaderModule;
};

// Keep plain uniform values by value, but retain resource identity and revision.
function snapshotUniformProps(value: any, depth = 4): any {
  if (!value || typeof value !== 'object' || depth === 0) return value;
  if (Array.isArray(value) || ArrayBuffer.isView(value))
    return Array.from(value as ArrayLike<unknown>);
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return typeof value.updateTimestamp === 'number'
      ? {resource: value, revision: value.updateTimestamp}
      : value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, snapshotUniformProps(entry, depth - 1)])
  );
}

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

  /** Whether every concrete input buffer fits a compute storage binding. */
  static supportsColumns(
    columns: (GPUVector | GPUConstant | undefined)[],
    byteLimit: number
  ): boolean {
    return columns.every(column => {
      if (!(column instanceof GPUVector)) return true;
      const {buffer} = getGPUVectorData(column);
      return !(buffer instanceof Buffer) || buffer.byteLength <= byteLimit;
    });
  }

  /** Attribute-generated integer columns retain the sparse CPU fallback. */
  static supportsAttributes(
    attributes: AggregationProps['attributes'],
    weights: readonly string[],
    byteLimit = Infinity
  ): boolean {
    const columns = ['positions', ...weights].flatMap(name =>
      Object.values(attributes[name]?.getGPUVector() || {})
    );
    return (
      this.supportsColumns(columns, byteLimit) &&
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
  get isLoaded(): boolean {
    return !this.dirty && (!this.props.readback || this.snapshot !== null);
  }
  private filterModel?: GPUVectorModel;
  private filterTexture?: Texture;
  private filterTarget?: Framebuffer;
  private props: AggregationProps = {pointCount: 0, attributes: {}, operations: [], binOptions: {}};
  private dirty = true;
  private revision = 0;
  private metadataRetryRevision = -1;
  private extensionUniformProps: Record<string, unknown> = {};
  private destroyed = false;
  private snapshot: {
    values: Float32Array[];
    counts: Uint32Array;
    range: [number, number][];
  } | null = null;
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
    if (options.shaders?.plugins?.length) {
      this.filterModel = new GPUVectorModel(device, {
        ...options.shaders,
        id: 'aggregation-extension-filter',
        source: getFilterSource(options.channelNames, options.binning),
        modules: [...(options.shaders.modules || []), aggregationUniforms, options.binOptions],
        vertexCount: 6,
        isInstanced: true,
        topology: 'triangle-list',
        colorAttachmentFormats: ['rgba8unorm'],
        parameters: {depthWriteEnabled: false}
      });
      this.filterTexture = device.createTexture({width: 1, height: 1, format: 'rgba8unorm'});
      this.filterTarget = device.createFramebuffer({colorAttachments: [this.filterTexture]});
    }
    this.zero = device.createBuffer({
      data: new Float32Array(3),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
  }

  setProps(props: Partial<AggregationProps>): void {
    if (props.shaderModuleProps && this.filterModel) {
      for (const plugin of this.options.shaders?.plugins || []) {
        const name = plugin.module?.name;
        if (name && name in props.shaderModuleProps) {
          const next = snapshotUniformProps(props.shaderModuleProps[name]);
          if (!deepEqual(next, this.extensionUniformProps[name], 4)) {
            this.extensionUniformProps[name] = next;
            this.setNeedsUpdate();
          }
        }
      }
    }
    for (const key in props) {
      if (key === 'attributes') {
        // Attribute objects are mutable; only the changed-attribute map signals new data.
        if (Object.keys(props.attributes!).length) this.setNeedsUpdate();
      } else if (
        key !== 'shaderModuleProps' &&
        key !== 'onUpdate' &&
        key !== 'onError' &&
        props[key] !== this.props[key]
      ) {
        this.setNeedsUpdate();
      }
    }
    if (props.attributes)
      props = {...props, attributes: {...this.props.attributes, ...props.attributes}};
    Object.assign(this.props, props);
    if (props.shaderModuleProps) {
      if (props.shaderModuleProps.project) {
        this.aggregate.shaderInputs.setProps({project: props.shaderModuleProps.project});
      }
      this.filterModel?.shaderInputs.setProps(props.shaderModuleProps);
    }
    if (props.binOptions) {
      const options = {[this.options.binOptions.name]: props.binOptions};
      this.aggregate.shaderInputs.setProps(options);
      this.filterModel?.shaderInputs.setProps(options);
    }
    const range = this.props.binIdRange;
    if (range) {
      this.columns = range[0][1] - range[0][0];
      const rows = range[1][1] - range[1][0];
      const count = this.columns * rows;
      this.binCount = Number.isFinite(count) && this.columns > 0 && rows > 0 ? count : 0;
    }
  }

  setNeedsUpdate(): void {
    this.revision++;
    this.snapshot = null;
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
      usage: Buffer.STORAGE | Buffer.COPY_SRC
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
    if (this.binCount && !this.run()) return;
    this.dirty = false;
    if (this.props.readback && this.binCount) {
      void this.readMetadata(this.revision);
    } else {
      if (this.props.readback)
        this.snapshot = {
          values: this.options.channelNames.map(() => new Float32Array(0)),
          counts: new Uint32Array(0),
          range: this.props.binIdRange || [
            [0, 0],
            [0, 0]
          ]
        };
      for (let channel = 0; channel < this.options.channelNames.length; channel++)
        this.props.onUpdate?.({channel});
    }
  }

  private run(): boolean {
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
        if (computation === this.aggregate && this.filterModel) {
          this.options.bindAttributes!(this.filterModel);
          this.filterModel.setInstanceCount(this.props.pointCount);
          this.filterModel.setBindings({bins: this.bins!});
          this.filterModel.shaderInputs.setProps({aggregation: {...settings, dispatchWidth: 0}});
          const pass = encoder.beginRenderPass({
            framebuffer: this.filterTarget!,
            clearColor: [0, 0, 0, 0]
          });
          const drawn = this.filterModel.draw(pass);
          pass.end();
          if (!drawn) {
            this.options.requestRedraw?.();
            return false;
          }
          continue;
        }
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
      return true;
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
  getResultValues(channel: number): Float32Array | null {
    return this.snapshot?.values[channel] || null;
  }
  getResultDomain(channel: number): [number, number] {
    const values = this.getResultValues(channel);
    let min = Infinity;
    let max = -Infinity;
    for (const value of values || [])
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    return min === Infinity ? [0, 0] : [min, max];
  }
  getBin(index: number) {
    const snapshot = this.snapshot;
    if (!snapshot || index < 0 || index >= snapshot.counts.length || !snapshot.counts[index])
      return null;
    const columns = snapshot.range[0][1] - snapshot.range[0][0];
    return {
      id: [
        (index % columns) + snapshot.range[0][0],
        Math.floor(index / columns) + snapshot.range[1][0]
      ],
      value: snapshot.values.map(values => values[index]),
      count: snapshot.counts[index]
    };
  }

  private async readMetadata(revision: number): Promise<void> {
    const length = this.binCount;
    const channels = this.options.channelNames.length;
    const range = this.props.binIdRange!.map(pair => [...pair] as [number, number]);
    try {
      const [valueBytes, countBytes] = await Promise.all([
        this.valueBuffer!.readAsync(),
        this.bins!.readAsync()
      ]);
      if (this.destroyed || revision !== this.revision) return;
      const packed = new Float32Array(
        valueBytes.buffer,
        valueBytes.byteOffset,
        valueBytes.byteLength / 4
      );
      const scratch = new Uint32Array(
        countBytes.buffer,
        countBytes.byteOffset,
        countBytes.byteLength / 4
      );
      const values = Array.from({length: channels}, (_, channel) =>
        Float32Array.from({length}, (_, i) => packed[i * channels + channel])
      );
      const counts = Uint32Array.from({length}, (_, i) => scratch[i * channels * 2]);
      this.snapshot = {values, counts, range};
      for (let channel = 0; channel < channels; channel++) {
        if (this.destroyed || revision !== this.revision) return;
        this.props.onUpdate?.({channel});
      }
    } catch (error) {
      if (!this.destroyed && revision === this.revision) {
        // Retry a transient mapping failure once; persistent errors are reported below.
        if (this.metadataRetryRevision !== revision) {
          this.metadataRetryRevision = revision;
          this.dirty = true;
          this.options.requestRedraw?.();
        }
        const failure = error instanceof Error ? error : new Error(String(error));
        if (this.props.onError) this.props.onError(failure);
        else this.device.reportError(failure, this.valueBuffer!)();
      }
    }
  }

  private destroyOutputs(): void {
    this.idBuffer?.destroy();
    this.valueBuffer?.destroy();
    this.ids?.destroy();
    for (const result of this.results) result.destroy();
  }

  destroy(): void {
    this.destroyed = true;
    this.revision++;
    this.filterModel?.destroy();
    this.filterTarget?.destroy();
    this.filterTexture?.destroy();
    this.initializeBins.destroy();
    this.aggregate.destroy();
    this.finalizeBins.destroy();
    this.destroyOutputs();
    this.bins?.destroy();
    this.zero.destroy();
  }
}
