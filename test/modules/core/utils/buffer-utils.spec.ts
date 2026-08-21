// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';
import {Buffer} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import {copyBuffer, toDoublePrecisionArrayGPU} from '@deck.gl/core/utils/buffer-utils';

function fromDoublePrecisionArray(array: Float32Array, size: number): number[] {
  const result: number[] = [];
  let index = 0;
  while (index < array.length) {
    result.push(array[index] + array[index + size]);
    index++;
    if (index % size === 0) {
      index += size;
    }
  }
  return result;
}

test('copyBuffer copies the requested GPU buffer range', async () => {
  const source = device.createBuffer({
    data: new Float32Array([1, 2, 3, 4]),
    usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
  });
  const destination = device.createBuffer({
    data: new Float32Array([9, 9, 9, 9]),
    usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
  });

  copyBuffer(source, destination, 8);

  const bytes = await destination.readAsync();
  expect(new Float32Array(bytes.buffer, bytes.byteOffset, 4)).toEqual(
    new Float32Array([1, 2, 9, 9])
  );
  source.destroy();
  destination.destroy();
});

test('toDoublePrecisionArrayGPU writes Float64Array into a target buffer', async () => {
  const source = Float64Array.from({length: 10}, (value, index) => index + Math.PI);
  const buffer = device.createBuffer({
    byteLength: source.length * 8,
    usage: Buffer.VERTEX | Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC
  });

  toDoublePrecisionArrayGPU(buffer, source, {size: 2});

  const bytes = await buffer.readAsync(0, source.length * 8);
  const result = new Float32Array(bytes.buffer, bytes.byteOffset, source.length * 2);
  expect(equals(fromDoublePrecisionArray(result, 2), source), 'array reconstructs ok').toBeTruthy();

  buffer.destroy();
});

test('toDoublePrecisionArrayGPU writes a source range at a target offset', async () => {
  const source = new Float64Array([Math.PI, Math.E, 3 + Math.PI, 3 + Math.E]);
  const buffer = device.createBuffer({
    byteLength: 48,
    usage: Buffer.VERTEX | Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC
  });

  toDoublePrecisionArrayGPU(buffer, source, {
    size: 2,
    startIndex: 2,
    endIndex: 4,
    byteOffset: 16
  });

  const bytes = await buffer.readAsync(16, 16);
  const result = new Float32Array(bytes.buffer, bytes.byteOffset, 4);
  expect(equals(fromDoublePrecisionArray(result, 2), source.slice(2, 4))).toBeTruthy();

  buffer.destroy();
});

test('toDoublePrecisionArrayGPU interleaves Float32Array with zero low parts', async () => {
  const source = new Float32Array([1, 2, 3, 4]);
  const buffer = device.createBuffer({
    byteLength: source.length * 8,
    usage: Buffer.VERTEX | Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC
  });

  toDoublePrecisionArrayGPU(buffer, source, {size: 2});

  const bytes = await buffer.readAsync(0, source.length * 8);
  expect(new Float32Array(bytes.buffer, bytes.byteOffset, source.length * 2)).toEqual(
    new Float32Array([1, 2, 0, 0, 3, 4, 0, 0])
  );

  buffer.destroy();
});
