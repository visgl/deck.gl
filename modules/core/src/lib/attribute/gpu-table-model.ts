// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type BufferLayout, type TypedArray} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {
  GPUConstant,
  GPUVector,
  getGPUVectorBuffer,
  getGPUVectorFormatInfo
} from '@luma.gl/gpgpu/gpu-data';

/**
 * Internal adaptation of luma.gl's experimental GPUTableModel for the installed
 * Model API. Consumes typed columns with deck.gl's resolved physical layouts.
 * Vectors remain caller-owned; only WebGPU constant buffers are owned here.
 */
export default class GPUTableModel extends Model {
  private constantBuffers: Record<string, Buffer> = {};

  /** Binds a complete column map using layouts resolved by AttributeManager. */
  setGPUAttributes(
    columns: Record<string, GPUVector | GPUConstant>,
    bufferLayouts: BufferLayout[]
  ): void {
    const buffers: Record<string, Buffer> = {};
    const constants: Record<string, TypedArray> = {};
    const usedConstantBuffers = new Set<string>();

    for (const layout of bufferLayouts) {
      const vector = columns[layout.name];
      if (vector instanceof GPUVector) {
        buffers[layout.name] = getGPUVectorBuffer(vector) as Buffer;
      }
      let constantByteLength = 0;
      for (const definition of layout.attributes || []) {
        const column = columns[definition.attribute];
        if (column instanceof GPUVector) {
          buffers[layout.name] = getGPUVectorBuffer(column) as Buffer;
        } else if (column instanceof GPUConstant) {
          constants[definition.attribute] = getShaderConstant(column);
          constantByteLength = Math.max(
            constantByteLength,
            (definition.byteOffset || 0) + column.byteLength
          );
        }
      }
      if (this.device.type === 'webgpu' && constantByteLength && !buffers[layout.name]) {
        const bytes = new Uint8Array(Math.ceil(constantByteLength / 4) * 4);
        for (const definition of layout.attributes || []) {
          const column = columns[definition.attribute];
          if (column instanceof GPUConstant) {
            bytes.set(
              new Uint8Array(column.value.buffer, column.value.byteOffset, column.byteLength),
              definition.byteOffset || 0
            );
          }
        }
        let buffer = this.constantBuffers[layout.name];
        if (!buffer || buffer.byteLength < bytes.byteLength) {
          buffer?.destroy();
          buffer = this.device.createBuffer({
            id: `${this.id}-${layout.name}-constant`,
            byteLength: bytes.byteLength,
            usage: Buffer.VERTEX | Buffer.COPY_DST | Buffer.COPY_SRC
          });
          this.constantBuffers[layout.name] = buffer;
        }
        buffer.write(bytes);
        buffers[layout.name] = buffer;
        usedConstantBuffers.add(layout.name);
      }
    }

    for (const name in this.constantBuffers) {
      if (!usedConstantBuffers.has(name)) {
        this.constantBuffers[name].destroy();
        delete this.constantBuffers[name];
      }
    }
    this.setBufferLayout(bufferLayouts);
    this.setAttributes(buffers);
    if (this.device.type === 'webgl') {
      this.setConstantAttributes(constants);
    }
  }

  override destroy(): void {
    for (const buffer of Object.values(this.constantBuffers)) {
      buffer.destroy();
    }
    this.constantBuffers = {};
    super.destroy();
  }
}

function getShaderConstant(column: GPUConstant): TypedArray {
  const info = getGPUVectorFormatInfo(column.format);
  if (!info.normalized) {
    if (info.integer) {
      return info.signed ? new Int32Array(column.value) : new Uint32Array(column.value);
    }
    return new Float32Array(column.value);
  }
  const bits = column.value.BYTES_PER_ELEMENT * 8;
  const maxValue = 2 ** bits - 1;
  // Match DataColumn.normalizeConstant, including its signed normalization.
  return new Float32Array(column.value).map(value =>
    info.signed ? ((value + 2 ** (bits - 1)) / maxValue) * 2 - 1 : value / maxValue
  );
}
