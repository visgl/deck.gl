// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Attribute} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {getGPUVectorData, getGPUVectorFormatInfo} from '@luma.gl/graph/gpu-data';
import {CPUAggregator, type CPUAggregatorProps} from './cpu-aggregator';

/** Options for an opt-in GPU-input to CPU-aggregation comparison. */
export type ReadbackAggregatorProps = CPUAggregatorProps & {
  /** Attribute names corresponding to weights, in channel order. */
  weightAttributes: readonly string[];
};

/** Copies borrowed GPU columns asynchronously before running ordinary CPU aggregation.
 * The layer owns this adapter; input vectors and buffers remain caller-owned.
 */
export class ReadbackAggregator extends CPUAggregator {
  private device?: Device;
  private revision = 0;
  private pendingRevision = -1;
  private completedRevision = -1;
  private retriedRevision = -1;
  private disposed = false;
  private readonly weightAttributes: readonly string[];
  private ownedAttributes: Attribute[] = [];

  /** Construct with the same bin/value accessors as CPUAggregator. */
  constructor(options: ReadbackAggregatorProps) {
    super(options);
    this.weightAttributes = options.weightAttributes;
    if (options.weightAttributes.length !== this.channelCount) {
      throw new Error('Readback weight attribute names must match aggregation channels');
    }
  }

  /** Called by the layer when adopting the adapter. */
  initialize(device: Device): void {
    this.device = device;
  }

  /** False while the current input revision is being copied or aggregated. */
  get isLoaded(): boolean {
    return !this.props.positions || this.completedRevision === this.revision;
  }

  /** Invalidate pending copies, including when buffer contents change in place. */
  override setNeedsUpdate(channel?: number): void {
    super.setNeedsUpdate(channel);
    this.revision = (this.revision || 0) + 1;
  }

  /** Accept borrowed columns; replacing a column invalidates outstanding readbacks. */
  override setProps(props: Parameters<CPUAggregator['setProps']>[0]): void {
    if (
      ('positions' in props && props.positions !== this.props.positions) ||
      ('weights' in props &&
        (props.weights?.length !== this.props.weights?.length ||
          props.weights?.some((weight, i) => weight !== this.props.weights?.[i])))
    ) {
      this.setNeedsUpdate();
    }
    super.setProps(props);
  }

  /** Start a copy without blocking the layer update cycle. */
  override update(): void {
    if (this.disposed)
      throw new Error('ReadbackAggregator has been destroyed; create a new adapter');
    if (!this.props.positions) {
      super.update();
      return;
    }
    if (this.completedRevision === this.revision || this.pendingRevision === this.revision) return;
    const revision = this.revision;
    this.pendingRevision = revision;
    void this.readInputs(revision);
  }

  /** Release owned CPU attributes and ignore outstanding copies. */
  override destroy(): void {
    this.disposed = true;
    for (const attribute of this.ownedAttributes) attribute.delete();
    this.ownedAttributes = [];
    super.destroy();
  }

  private async readInputs(revision: number): Promise<void> {
    let copying = false;
    try {
      if (!this.device) throw new Error('ReadbackAggregator must be initialized before update');
      const {positions, weights, pointCount} = this.props;
      if (!weights || weights.length !== this.channelCount)
        throw new Error('Readback requires one weight vector per channel');
      const columns = [positions!, ...weights];
      const names = ['positions', ...this.weightAttributes];
      const layouts = columns.map((column, index) => {
        const info = getGPUVectorFormatInfo(column.format!);
        if (
          info.type !== 'float32' ||
          info.vertexList ||
          info.valueList ||
          (index === 0 ? ![2, 3].includes(info.components) : info.components !== 1)
        ) {
          throw new Error('Readback requires fixed-width float32 positions and scalar weights');
        }
        if (pointCount < 0 || !Number.isInteger(pointCount) || pointCount > column.length)
          throw new Error('Readback row count exceeds input length');
        const data = getGPUVectorData(column);
        if (!(data.buffer instanceof Buffer) || !(data.buffer.usage & Buffer.COPY_SRC))
          throw new Error('Readback inputs require COPY_SRC buffers');
        return {data, size: info.components};
      });
      const buffers = [...new Set(layouts.map(({data}) => data.buffer))];
      copying = true;
      const bytes = await Promise.all(buffers.map(buffer => buffer.readAsync()));
      copying = false;
      if (this.disposed || revision !== this.revision) return;
      const attributes: Record<string, Attribute> = {...this.props.attributes};
      const owned = layouts.map(({data, size}, index) => {
        const source = bytes[buffers.indexOf(data.buffer)];
        const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
        const value = new Float32Array(pointCount * size);
        for (let row = 0; row < pointCount; row++) {
          for (let component = 0; component < size; component++) {
            value[row * size + component] = view.getFloat32(
              data.byteOffset + row * data.byteStride + component * 4,
              true
            );
          }
        }
        const attribute = new Attribute(this.device!, {
          id: names[index],
          size,
          type: 'float32',
          noAlloc: true
        });
        // CPU accessors only need the value and constructor-provided layout.
        // setData would allocate and upload a GPU buffer for this readback.
        attribute.value = value;
        attributes[names[index]] = attribute;
        return attribute;
      });
      for (const attribute of this.ownedAttributes) attribute.delete();
      this.ownedAttributes = owned;
      super.setProps({attributes});
      // Notify the owner only after every channel has completed successfully.
      const onUpdate = this.props.onUpdate;
      const channels: number[] = [];
      this.props.onUpdate = ({channel}) => channels.push(channel);
      try {
        super.update();
      } finally {
        this.props.onUpdate = onUpdate;
      }
      this.completedRevision = revision;
      for (const channel of channels) onUpdate?.({channel});
    } catch (error) {
      if (!this.disposed && revision === this.revision) {
        this.completedRevision = -1;
        super.setNeedsUpdate();
        // Retry a transient copy failure once without requiring a layer prop change.
        // Persistent failures remain retryable on the next explicit update.
        if (copying && this.retriedRevision !== revision) {
          this.retriedRevision = revision;
          queueMicrotask(() => {
            if (!this.disposed && revision === this.revision) this.update();
          });
        }
        this.props.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (this.pendingRevision === revision) this.pendingRevision = -1;
    }
  }
}
