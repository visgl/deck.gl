// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Device} from '@luma.gl/core';
import {GPUVector, type GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {DataType, Float64, Vector} from 'apache-arrow';

export type PreparedArrowGPUVector = {
  vector: GPUVector;
  residualVector?: GPUVector;
  validityVector?: GPUVector;
  ownsVector: true;
  destroy(): void;
};

/** Converts numeric Arrow chunks independently; uploaded buffers belong to the result. */
export function uploadArrowVector(
  device: Device,
  vector: Vector,
  options: {
    name?: string;
    format: GPUVectorFormat;
    color: boolean;
    preserveNulls: boolean;
    fp64?: boolean;
    transform?: (value: number[]) => readonly number[];
  }
): PreparedArrowGPUVector {
  const {name = 'arrow-column', format, color, preserveNulls} = options;
  const width = format === 'float32' ? 1 : Number(/x([234])$/.exec(format)?.[1]);
  if (!width || (!format.startsWith('float32') && format !== 'unorm8x4')) {
    throw new Error(`Unsupported Arrow output format: ${format}`);
  }
  const list = DataType.isFixedSizeList(vector.type);
  const sourceWidth = list ? vector.type.listSize : 1;
  const type = list ? vector.type.children[0].type : vector.type;
  if (!DataType.isInt(type) && !DataType.isFloat(type)) {
    throw new Error('Arrow input must contain numeric values');
  }
  if ((!color && sourceWidth > width) || (color && ![3, 4].includes(sourceWidth))) {
    throw new Error('Arrow input width does not match the requested output format');
  }
  const parts: GPUVector[] = [];
  const residuals: GPUVector[] = [];
  const validity: GPUVector[] = [];
  const owned: GPUVector[] = [];
  const upload = (
    values: Float32Array | Uint8Array | Uint32Array,
    rows: number,
    outputFormat: GPUVectorFormat
  ) => {
    // WebGPU copies require an aligned allocation, including odd-sized validity data.
    const bytes = new Uint8Array(Math.ceil(values.byteLength / 4) * 4);
    bytes.set(new Uint8Array(values.buffer, values.byteOffset, values.byteLength));
    const buffer = device.createBuffer({
      data: bytes,
      usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
    });
    try {
      const result = new GPUVector({
        type: 'buffer',
        name,
        buffer,
        ownsBuffer: true,
        format: outputFormat,
        length: rows
      });
      owned.push(result);
      return result;
    } catch (error) {
      buffer.destroy();
      throw error;
    }
  };
  try {
    for (const data of vector.data) {
      const chunk = new Vector([data]);
      const values =
        format === 'unorm8x4'
          ? new Uint8Array(chunk.length * width)
          : new Float32Array(chunk.length * width);
      const low =
        (options.fp64 || options.transform || type instanceof Float64) && !color
          ? new Float32Array(values.length)
          : undefined;
      const valid = preserveNulls ? new Uint32Array(chunk.length) : undefined;
      for (let row = 0; row < chunk.length; row++) {
        const value = chunk.get(row);
        const source = Array.from({length: sourceWidth}, (_, component) =>
          list ? value?.get(component) : value
        );
        let rowValid =
          value !== null &&
          source.every(component => component !== null && component !== undefined);
        const transformed =
          options.transform && rowValid ? options.transform(source.map(Number)) : source;
        for (let component = 0; component < width; component++) {
          const input = component < transformed.length ? transformed[component] : color ? 255 : 0;
          rowValid &&= input !== null && input !== undefined;
          let number = Number(input ?? 0);
          // Floating point colors use [0, 1]; integer colors use [0, 255].
          if (color && DataType.isFloat(type) && component < sourceWidth) number *= 255;
          const offset = row * width + component;
          values[offset] = color ? Math.round(Math.max(0, Math.min(255, number))) : number;
          if (low) low[offset] = number - values[offset];
        }
        if (!rowValid && !preserveNulls) throw new Error('Arrow column contains null rows');
        if (valid) valid[row] = Number(rowValid);
      }
      parts.push(upload(values, chunk.length, format));
      if (low) residuals.push(upload(low, chunk.length, format));
      if (valid) validity.push(upload(valid, chunk.length, 'uint32'));
    }
    const combine = (chunks: GPUVector[], outputFormat: GPUVectorFormat) =>
      new GPUVector({
        type: 'data',
        name,
        data: chunks.flatMap(chunk => chunk.data),
        format: outputFormat,
        ownsData: false
      });
    return {
      vector: combine(parts, format),
      residualVector: residuals.length ? combine(residuals, format) : undefined,
      validityVector: validity.length ? combine(validity, 'uint32') : undefined,
      ownsVector: true,
      destroy: () => {
        for (const chunk of owned.splice(0)) chunk.destroy();
      }
    };
  } catch (error) {
    for (const chunk of owned) chunk.destroy();
    throw error;
  }
}
