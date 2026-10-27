// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/test-utils';
import {Field, FixedSizeList, Float32, Float64, Table, vectorFromArray} from 'apache-arrow';
import {ArrowConverter} from '@deck.gl/core/arrow';

function positions() {
  return vectorFromArray(
    [
      [1, 2],
      [3, 4]
    ],
    new FixedSizeList(2, new Field('values', new Float32(), false))
  );
}

test('ArrowConverter uploads positions and preserves chunks', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const source = positions().concat(positions());
  const result = await converter.convert(source, {semantic: 'position'});
  expect(result.vector.format).toBe('float32x2');
  expect(result.vector.length).toBe(4);
  expect(result.vector.data).toHaveLength(2);
  expect(result.ownsVector).toBe(true);
  result.destroy();
  result.destroy();
  expect(result.vector.data.every(data => data.buffer!.destroyed)).toBe(true);
  expect(source.length).toBe(4);
  device.destroy();
});

test('ArrowConverter streams lazily and leaves yielded resources caller-owned', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const iterator = {
    next: vi.fn(async () => ({done: false as const, value: positions()})),
    return: vi.fn(async () => ({done: true as const, value: undefined}))
  };
  const stream = converter.convertVectors(iterator, {semantic: 'position'});
  expect(iterator.next).not.toHaveBeenCalled();
  const first = (await stream.next()).value!;
  expect(first.rowOffset).toBe(0);
  expect(iterator.next).toHaveBeenCalledTimes(1);
  const second = (await stream.next()).value!;
  expect(second.rowOffset).toBe(2);
  await stream.return(undefined);
  expect(iterator.return).toHaveBeenCalledOnce();
  expect(first.vector.data[0].buffer!.destroyed).toBe(false);
  first.destroy();
  second.destroy();
  device.destroy();
});

test('ArrowConverter cancels a stalled read and closes a bare async iterator', async () => {
  const device = new NullDevice({});
  const controller = new AbortController();
  const iterator = {
    next: vi.fn(() => new Promise<IteratorResult<ReturnType<typeof positions>>>(() => {})),
    return: vi.fn(async () => ({done: true as const, value: undefined}))
  };
  const stream = new ArrowConverter(device).convertVectors(
    iterator,
    {},
    {signal: controller.signal}
  );
  const next = stream.next();
  await vi.waitFor(() => expect(iterator.next).toHaveBeenCalledOnce());
  controller.abort(new Error('cancelled'));
  await expect(next).rejects.toThrow('cancelled');
  expect(iterator.return).toHaveBeenCalledOnce();
  device.destroy();
});

test('ArrowConverter rolls back partial batch conversion', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const buffers = vi.spyOn(device, 'createBuffer');
  const batch = new Table({positions: positions()}).batches[0];
  await expect(
    converter.convertBatch(batch, {
      positions: {source: 'positions', semantic: 'position'},
      missing: {source: 'missing', semantic: 'scalar'}
    })
  ).rejects.toThrow('missing');
  expect(buffers.mock.results.length).toBeGreaterThan(0);
  for (const result of buffers.mock.results) expect(result.value.destroyed).toBe(true);
  device.destroy();
});

test('ArrowConverter validates nulls and semantic position shape', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  await expect(
    converter.convert(vectorFromArray([1, null], new Float32()), {semantic: 'scalar'})
  ).rejects.toThrow('null');
  await expect(
    converter.convert(vectorFromArray([1, 2], new Float32()), {semantic: 'position'})
  ).rejects.toThrow('FixedSizeList');
  const preserved = await converter.convert(vectorFromArray([1, null], new Float32()), {
    semantic: 'scalar',
    nullPolicy: 'preserve'
  });
  expect(preserved.vector.length).toBe(2);
  preserved.destroy();
  device.destroy();
});

test('ArrowConverter converts aligned batches with cumulative row offsets', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const table = new Table({positions: positions(), radii: vectorFromArray([2, 3], new Float32())});
  const results = [];
  for await (const result of converter.convertBatches([table.batches[0], table.batches[0]], {
    positions: {source: 'positions', semantic: 'position'},
    radii: {source: 'radii', semantic: 'scalar'}
  })) {
    results.push(result);
    expect(result.columns.positions.vector.length).toBe(result.length);
    expect(result.columns.radii.vector.length).toBe(result.length);
  }
  expect(results.map(result => result.rowOffset)).toEqual([0, 2]);
  for (const result of results) result.destroy();
  device.destroy();
});

test('ArrowConverter rejects stream format changes and releases the rejected output', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const first = positions();
  const second = vectorFromArray(
    [[1, 2, 3]],
    new FixedSizeList(3, new Field('values', new Float32(), false))
  );
  const buffers = vi.spyOn(device, 'createBuffer');
  const stream = converter.convertVectors([first, second], {semantic: 'position'});
  const result = (await stream.next()).value!;
  const originalCount = buffers.mock.results.length;
  await expect(stream.next()).rejects.toThrow('format changed');
  for (const buffer of buffers.mock.results.slice(originalCount))
    expect(buffer.value.destroyed).toBe(true);
  expect(result.vector.data[0].buffer!.destroyed).toBe(false);
  result.destroy();
  device.destroy();
});

test('ArrowConverter uploads sliced numeric chunks and Float64 residuals', async () => {
  const device = new NullDevice({});
  const buffers = vi.spyOn(device, 'createBuffer');
  const source = vectorFromArray([100, 1.00000001, 2.00000002], new Float64()).slice(1);
  const result = await new ArrowConverter(device).convert(source, {semantic: 'scalar'});
  const values = buffers.mock.calls.map(([props]) => {
    const bytes = props!.data as Uint8Array;
    return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
  });
  expect(Array.from(values[0])).toEqual([1, 2]);
  expect(values[0][0] + values[1][0]).toBeCloseTo(1.00000001, 14);
  expect(result.residualVector?.length).toBe(2);
  result.destroy();
  device.destroy();
});

test('ArrowConverter expands RGB floats to normalized RGBA bytes', async () => {
  const device = new NullDevice({});
  const buffers = vi.spyOn(device, 'createBuffer');
  const source = vectorFromArray(
    [[1, 0.5, 0]],
    new FixedSizeList(3, new Field('values', new Float32(), false))
  );
  const result = await new ArrowConverter(device).convert(source, {semantic: 'color'});
  expect(Array.from(buffers.mock.calls[0][0]!.data as Uint8Array)).toEqual([255, 128, 0, 255]);
  result.destroy();
  device.destroy();
});

test('ArrowConverter owns special output names during destruction and rollback', async () => {
  const device = new NullDevice({});
  const converter = new ArrowConverter(device);
  const batch = new Table({positions: positions()}).batches[0];
  const schema = JSON.parse('{"__proto__":{"source":"positions","semantic":"position"}}');
  const result = await converter.convertBatch(batch, schema);
  expect(Object.hasOwn(result.columns, '__proto__')).toBe(true);
  const buffer = result.columns.__proto__.vector.data[0].buffer!;
  result.destroy();
  expect(buffer.destroyed).toBe(true);
  const buffers = vi.spyOn(device, 'createBuffer');
  await expect(
    converter.convertBatch(batch, {...schema, missing: {source: 'missing'}})
  ).rejects.toThrow('missing');
  for (const upload of buffers.mock.results) expect(upload.value.destroyed).toBe(true);
  device.destroy();
});

test('ArrowConverter ignores child nulls outside a list slice', async () => {
  const device = new NullDevice({});
  const source = vectorFromArray(
    [
      [null, 2],
      [3, 4]
    ],
    new FixedSizeList(2, new Field('values', new Float32(), true))
  );
  const converter = new ArrowConverter(device);
  await expect(converter.convert(source, {semantic: 'position'})).rejects.toThrow('null');
  const result = await converter.convert(source.slice(1), {
    semantic: 'position',
    format: 'float32x3'
  });
  expect(result.vector.length).toBe(1);
  expect(result.vector.format).toBe('float32x3');
  result.destroy();
  device.destroy();
});
