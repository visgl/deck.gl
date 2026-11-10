// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {snapshotUniformProps} from '../common/utils/prop-utils';
import {AggregationInputsNotReady} from '../common/aggregator/deck-graph/deck-aggregation-inputs-operation';
import {project32, _deepEqual as deepEqual} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import type {
  Aggregator,
  AggregationProps,
  AggregationShaderContext
} from '../common/aggregator/aggregator';
import {AggregationColumnPreparation} from '../common/aggregator/webgpu-aggregator/column-preparation';
import {ScreenGridGraph} from './screen-grid-graph';
import {aggregationUniforms} from '../common/aggregator/webgpu-aggregator/aggregation-uniforms';
import {finalizeSource} from '../common/aggregator/webgpu-aggregator/reduce.wgsl';
import {binOptionsUniforms} from './bin-options-uniforms';

const screenGridBinning = `fn getBin(position: vec3f, low: vec3f) -> BinAssignment {
  let clip = project_position_to_clipspace(position, low, vec3f(0.0));
  let viewport = project.viewportSize / project.devicePixelRatio;
  let pixel = vec2f(clip.x / clip.w + 1.0, 1.0 - clip.y / clip.w) * 0.5 * viewport;
  let valid = clip.w > 0.0 && all(pixel >= vec2f(0.0)) && all(pixel < viewport);
  return BinAssignment(vec2i(floor(pixel / binOptions.cellSizePixels)), valid);
}`;

/** Opt-in ScreenGridLayer aggregation using GPU graph operations.
 * Pass an instance as the layer's `aggregator` prop. The layer initializes and destroys
 * it; input vectors remain borrowed. Input shader hooks run as deck graph operations.
 */
export class GraphScreenGridAggregator implements Aggregator {
  /** Input shader extensions are evaluated before grouped reduction. */
  readonly supportsExtensions = true;
  /** Borrowed positions cannot be converted on the CPU by this graph implementation. */
  readonly requiresProjectedPositions = true;
  /** Number of dense screen cells in the current grid. */
  binCount = 0;
  /** Whether requested output metadata is ready. */
  get isLoaded(): boolean {
    return !this.dirty && (!this.props.readback || this.snapshot !== null);
  }
  private props: AggregationProps = {pointCount: 0, attributes: {}, operations: [], binOptions: {}};
  private shaderContext?: AggregationShaderContext;
  private extensionUniformProps: Record<string, unknown> = {};
  private dirty = true;
  private revision = 0;
  private metadataRetryRevision = -1;
  private destroyed = false;
  private snapshot: {
    values: Float32Array;
    counts: Uint32Array;
    range: [number, number][];
  } | null = null;
  private columns = 0;
  private bins: Buffer | null = null;
  private idBuffer: Buffer | null = null;
  private valueBuffer: Buffer | null = null;
  private ids: GPUVector | null = null;
  private result: GPUVector | null = null;
  private device!: Device;
  private graph!: ScreenGridGraph;
  private finalizeBins!: Computation;
  private zero!: Buffer;

  /** Allocate resources when ScreenGridLayer adopts this instance. Requires a WebGPU device. */
  initialize(device: Device): void {
    if (this.destroyed) throw new Error('GraphScreenGridAggregator has been destroyed');
    if (this.device) {
      if (this.device !== device) throw new Error('An aggregator cannot be shared across devices');
      return;
    }
    if (device.type !== 'webgpu') throw new Error('GraphScreenGridAggregator requires WebGPU');
    this.device = device;
    this.graph = new ScreenGridGraph(device, screenGridBinning, [
      project32,
      aggregationUniforms,
      binOptionsUniforms
    ]);
    this.finalizeBins = new Computation(device, {
      id: 'graph-screen-grid-finalize',
      source: finalizeSource,
      modules: [aggregationUniforms]
    });
    this.zero = device.createBuffer({
      data: new Float32Array(3),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
  }

  /** Receive layer-owned shaders and attribute bindings without coupling the graph executor to deck. */
  setShaderContext(context: AggregationShaderContext): void {
    this.shaderContext = context;
    this.extensionUniformProps = {};
    this.graph.setShaderContext(context);
    this.setNeedsUpdate();
  }

  /** Accept ScreenGrid inputs and invalidate outputs when those inputs change. */
  setProps(props: Partial<AggregationProps>): void {
    if (this.destroyed) throw new Error('GraphScreenGridAggregator has been destroyed');
    for (const plugin of this.shaderContext?.shaders.plugins || []) {
      const name = plugin.module?.name;
      if (name && props.shaderModuleProps && name in props.shaderModuleProps) {
        const next = snapshotUniformProps(props.shaderModuleProps[name]);
        if (!deepEqual(next, this.extensionUniformProps[name], 4)) {
          this.extensionUniformProps[name] = next;
          this.setNeedsUpdate();
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
        key !== 'onNeedsRedraw' &&
        props[key] !== this.props[key]
      ) {
        this.setNeedsUpdate();
      }
    }
    if (props.attributes)
      props = {...props, attributes: {...this.props.attributes, ...props.attributes}};
    Object.assign(this.props, props);
    if (props.shaderModuleProps) this.graph.setShaderModuleProps(props.shaderModuleProps);
    if (props.binOptions) this.graph.setShaderModuleProps({binOptions: props.binOptions});
    const range = this.props.binIdRange;
    if (range) {
      this.columns = range[0][1] - range[0][0];
      const rows = range[1][1] - range[1][0];
      const count = this.columns * rows;
      this.binCount = Number.isFinite(count) && this.columns > 0 && rows > 0 ? count : 0;
    }
  }

  /** Invalidate results and pending metadata copies. */
  setNeedsUpdate(): void {
    this.revision++;
    this.snapshot = null;
    this.dirty = true;
  }

  /** Allocate borrowed output vectors before the layer renders. */
  update(): void {
    if (this.destroyed) throw new Error('GraphScreenGridAggregator has been destroyed');
    if (!this.device) throw new Error('Initialize GraphScreenGridAggregator before updating');
    if (this.ids?.length === this.binCount) return;
    this.destroyOutputs();
    this.bins?.destroy();
    const capacity = Math.max(1, this.binCount);
    const usage = Buffer.STORAGE | Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST;
    this.bins = this.device.createBuffer({
      byteLength: capacity * 8,
      usage: Buffer.STORAGE | Buffer.COPY_SRC
    });
    this.idBuffer = this.device.createBuffer({byteLength: capacity * 8, usage});
    this.valueBuffer = this.device.createBuffer({byteLength: capacity * 4, usage});
    this.ids = new GPUVector({
      type: 'buffer',
      name: 'binIds',
      format: 'float32x2',
      length: this.binCount,
      buffer: this.idBuffer,
      ownsBuffer: false
    });
    this.result = new GPUVector({
      type: 'buffer',
      name: 'counts',
      format: 'float32',
      length: this.binCount,
      buffer: this.valueBuffer,
      ownsBuffer: false
    });
  }

  /** Encode graph aggregation before the cell layer draws. */
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
          values: new Float32Array(0),
          counts: new Uint32Array(0),
          range: this.props.binIdRange || [
            [0, 0],
            [0, 0]
          ]
        };
      this.props.onUpdate?.({channel: 0});
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
      const weight = columns.prepare(
        this.props.weights?.[0] || attributes.counts?.getGPUVector().counts,
        1
      );
      const operation = ['SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'].indexOf(
        this.props.operations[0] || 'SUM'
      );
      const range = this.props.binIdRange!;
      const settings = {
        counts: [this.props.pointCount, this.binCount, this.columns, 1],
        operations: [operation, 0, 0, 0],
        binRange: [...range[0], ...range[1]],
        positionLayout: p.layout,
        lowLayout: low.layout,
        weightLayout0: weight.layout
      };
      this.graph.encode(encoder, settings, {
        positions: p.buffer,
        positionsLow: low.buffer,
        weights: weight.buffer,
        bins: this.bins!
      });
      this.finalizeBins.setBindings({
        bins: this.bins!,
        binIds: this.idBuffer!,
        values: this.valueBuffer!
      });
      const groups = Math.ceil(this.binCount / 64);
      const width = Math.min(groups, this.device.limits.maxComputeWorkgroupsPerDimension);
      this.finalizeBins.shaderInputs.setProps({
        aggregation: {...settings, dispatchWidth: width * 64}
      });
      this.finalizeBins.predraw(encoder);
      const pass = encoder.beginComputePass();
      this.finalizeBins.dispatch(pass, width, Math.ceil(groups / width));
      pass.end();
      this.device.submit(encoder.finish());
      return true;
    } catch (error) {
      if (error instanceof AggregationInputsNotReady) {
        // Keep model uploads encoded by predraw(), while leaving public outputs untouched.
        this.device.submit(encoder.finish());
        this.props.onNeedsRedraw?.();
        return false;
      }
      throw error;
    } finally {
      encoder.destroy();
      columns.destroy();
    }
  }

  /** Return borrowed screen-cell coordinates. */
  getBins(): GPUVector | null {
    return this.ids;
  }
  /** Return the borrowed weight vector for channel zero. */
  getResult(channel: number): GPUVector | null {
    return channel === 0 ? this.result : null;
  }
  /** Return a completed CPU snapshot when readback was requested. */
  getResultValues(channel: number): Float32Array | null {
    return channel === 0 ? this.snapshot?.values || null : null;
  }
  /** Return the completed finite weight extent, or [0, 0]. */
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
  /** Return completed picking metadata for a nonempty cell. */
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
      value: [snapshot.values[index]],
      count: snapshot.counts[index]
    };
  }

  private async readMetadata(revision: number): Promise<void> {
    const length = this.binCount;
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
      const values = packed.slice(0, length);
      const counts = Uint32Array.from({length}, (_, i) => scratch[i * 2]);
      this.snapshot = {values, counts, range};
      this.props.onUpdate?.({channel: 0});
    } catch (error) {
      if (!this.destroyed && revision === this.revision) {
        // Retry a transient mapping failure once; persistent errors are reported below.
        if (this.metadataRetryRevision !== revision) {
          this.metadataRetryRevision = revision;
          this.dirty = true;
          this.props.onNeedsRedraw?.();
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
    this.result?.destroy();
  }

  /** Release graph-owned resources and invalidate pending copies. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.revision++;
    this.graph?.destroy();
    this.finalizeBins?.destroy();
    this.destroyOutputs();
    this.bins?.destroy();
    this.zero?.destroy();
  }
}
