// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Device, type CommandEncoder} from '@luma.gl/core';
import {
  GPUConstant,
  GPUVector,
  getGPUVectorData,
  getGPUVectorFormatInfo
} from '@luma.gl/graph/gpu-data';

/** Storage binding and float-element layout used by aggregation kernels. */
type PreparedColumn = {buffer: Buffer; layout: [number, number, number, number]};

/** Prepares borrowed columns for one compute submission; owns only temporary copies. */
export class AggregationColumnPreparation {
  private readonly temporary: Buffer[] = [];

  constructor(
    private readonly device: Device,
    private readonly encoder: CommandEncoder,
    private readonly zero: Buffer
  ) {}

  prepare(column: GPUVector | GPUConstant | undefined, components: number): PreparedColumn {
    if (!column) return {buffer: this.zero, layout: [0, 0, components, 0]};
    if (!column.format) throw new Error('Aggregation requires typed columns');
    const info = getGPUVectorFormatInfo(column.format);
    if (
      info.type !== 'float32' ||
      info.components !== components ||
      info.vertexList ||
      info.valueList
    ) {
      throw new Error('Aggregation requires fixed-width float32 columns');
    }
    if (column instanceof GPUConstant) {
      const buffer = this.device.createBuffer({
        data: column.value,
        usage: Buffer.STORAGE | Buffer.COPY_DST
      });
      this.temporary.push(buffer);
      return {buffer, layout: [0, 0, components, 0]};
    }
    const data = getGPUVectorData(column);
    if (!(data.buffer instanceof Buffer)) throw new Error('Aggregation requires concrete buffers');
    let buffer = data.buffer;
    if (!(buffer.usage & Buffer.STORAGE)) {
      if (!(buffer.usage & Buffer.COPY_SRC))
        throw new Error('Aggregation inputs require STORAGE or COPY_SRC usage');
      const copy = this.device.createBuffer({
        byteLength: buffer.byteLength,
        usage: Buffer.STORAGE | Buffer.COPY_DST
      });
      this.temporary.push(copy);
      this.encoder.copyBufferToBuffer({
        sourceBuffer: buffer,
        destinationBuffer: copy,
        size: buffer.byteLength
      });
      buffer = copy;
    }
    return {buffer, layout: [data.byteOffset / 4, data.byteStride / 4, components, 0]};
  }

  destroy(): void {
    for (const buffer of this.temporary) buffer.destroy();
    this.temporary.length = 0;
  }
}
