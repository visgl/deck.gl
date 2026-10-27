// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {ArrowConverter} from '@deck.gl/core/arrow';
import {ScatterplotLayerColumns} from '../../../modules/layers/src/scatterplot-layer/scatterplot-layer-columns';

function positions() {
  return vectorFromArray(
    [
      [1, 2],
      [3, 4]
    ],
    new FixedSizeList(2, new Field('values', new Float32(), false))
  );
}
function props() {
  return {
    positions: positions(),
    data: [],
    getRadius: 1,
    getFillColor: [0, 0, 0, 255],
    getLineColor: [0, 0, 0, 255],
    getLineWidth: 1,
    getPixelOffset: [0, 0]
  };
}

test('Scatterplot rejects mismatched columns without destroying the previous uploads', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const error = vi.fn();
  await columns.update(props(), () => {}, error);
  const old = (columns as any).prepared;
  const buffer = old.columns.instancePositions.data[0].buffer;
  const buffers = vi.spyOn(device, 'createBuffer');
  await columns.update({...props(), radii: vectorFromArray([1], new Float32())}, () => {}, error);
  expect(error).toHaveBeenCalledOnce();
  expect((columns as any).prepared).toBe(old);
  expect(buffer.destroyed).toBe(false);
  for (const result of buffers.mock.results) expect(result.value.destroyed).toBe(true);
  columns.destroy();
  device.destroy();
});

test('Scatterplot discards an upload superseded by a newer update', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const error = vi.fn();
  let resume!: () => void;
  const gate = new Promise<void>(resolve => {
    resume = resolve;
  });
  const convert = ArrowConverter.prototype.convert;
  let calls = 0;
  const spy = vi.spyOn(ArrowConverter.prototype, 'convert').mockImplementation(async function (
    this: ArrowConverter,
    ...args
  ) {
    if (++calls === 1) await gate;
    return convert.apply(this, args);
  });
  try {
    const older = columns.update(props(), () => {}, error);
    await columns.update(props(), () => {}, error);
    const current = (columns as any).prepared;
    const buffer = current.columns.instancePositions.data[0].buffer;
    const buffers = vi.spyOn(device, 'createBuffer');
    resume();
    await older;
    expect((columns as any).prepared).toBe(current);
    expect(error).not.toHaveBeenCalled();
    expect(buffer.destroyed).toBe(false);
    for (const result of buffers.mock.results) expect(result.value.destroyed).toBe(true);
  } finally {
    spy.mockRestore();
    columns.destroy();
    device.destroy();
  }
});

test('Scatterplot attempts invalid inputs once and retries changed inputs', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const input = {...props(), radii: vectorFromArray([1], new Float32())};
  const error = vi.fn();
  await columns.update(input, () => {}, error);
  expect(error).toHaveBeenCalledOnce();
  expect(columns.needsUpdate(input, input)).toBe(false);
  expect(columns.needsUpdate({...input, radii: undefined}, input)).toBe(true);
  columns.destroy();
  device.destroy();
});

test('Scatterplot evaluates fallback accessors without rows and rejects partial row data', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const seen: unknown[] = [];
  const getRadius = vi.fn((row, {index}) => {
    seen.push([row, index]);
    return index + 1;
  });
  const error = vi.fn();
  await columns.update({...props(), getRadius}, () => {}, error);
  expect(error).not.toHaveBeenCalled();
  expect(seen).toEqual([
    [null, 0],
    [null, 1]
  ]);
  const old = (columns as any).prepared;
  await columns.update({...props(), data: [{}]}, () => {}, error);
  expect(error.mock.calls[0][0].message).toMatch('data rows');
  expect((columns as any).prepared).toBe(old);
  columns.destroy();
  device.destroy();
});

test('Scatterplot preserves transformed fallback position residuals', async () => {
  const device = new NullDevice({});
  const buffers = vi.spyOn(device, 'createBuffer');
  const columns = new ScatterplotLayerColumns(device);
  const transform = vi.fn(value => [value[0] + 0.00000001, value[1] * 2, 0]);
  const error = vi.fn();
  await columns.update(
    {
      ...props(),
      positions: undefined,
      radii: vectorFromArray([1, 2], new Float32()),
      getPosition: () => [1, 2]
    },
    () => {},
    error,
    {fp64: true, transform}
  );
  expect(error).not.toHaveBeenCalled();
  expect(transform).toHaveBeenCalledTimes(2);
  const data = buffers.mock.calls
    .map(([options]) => options!.data)
    .filter(value => value instanceof Float32Array) as Float32Array[];
  expect(Array.from(data[data.length - 1]).slice(0, 3)).toEqual([1, 4, 0]);
  expect(data[data.length - 2][0]).toBeCloseTo(0.00000001, 14);
  columns.destroy();
  device.destroy();
});

test('Scatterplot borrows strided binary fallbacks and releases owned uploads', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const buffer = device.createBuffer({data: new Float32Array([99, 3, 99, 5])});
  const getRadius = vi.fn(() => 1);
  const error = vi.fn();
  await columns.update(
    {
      ...props(),
      data: {length: 2, attributes: {getRadius: {buffer, offset: 4, stride: 8}}},
      getRadius
    },
    () => {},
    error
  );
  expect(error).not.toHaveBeenCalled();
  expect(getRadius).not.toHaveBeenCalled();
  const radius = (columns as any).prepared.columns.instanceRadius;
  expect(radius.data[0].buffer).toBe(buffer);
  expect(radius.data[0].byteOffset).toBe(4);
  expect(radius.data[0].byteStride).toBe(8);
  columns.destroy();
  expect(buffer.destroyed).toBe(false);
  buffer.destroy();
  device.destroy();
});
