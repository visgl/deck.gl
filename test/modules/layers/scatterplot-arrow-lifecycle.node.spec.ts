// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/test-utils';
import {Field, FixedSizeList, Float32, Table, vectorFromArray} from 'apache-arrow';
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

test('Scatterplot reuses generator rows for all accessors and later column updates', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  function* rows() {
    yield {position: [1, 2], radius: 3};
    yield {position: [3, 4], radius: 5};
  }
  const data = rows();
  const getPosition = vi.fn(row => row.position);
  const getRadius = vi.fn(row => row.radius);
  const error = vi.fn();
  const input = {
    ...props(),
    positions: undefined,
    radii: vectorFromArray([1, 2], new Float32()),
    data,
    getPosition,
    getRadius
  };
  await columns.update(input, () => {}, error);
  await columns.update(
    {
      ...input,
      radii: undefined,
      fillColors: vectorFromArray(
        [
          [1, 0, 0, 1],
          [0, 1, 0, 1]
        ],
        new FixedSizeList(4, new Field('values', new Float32(), false))
      )
    },
    () => {},
    error
  );
  expect(error).not.toHaveBeenCalled();
  expect(getPosition.mock.calls.map(([row]) => row.position)).toEqual([
    [1, 2],
    [3, 4],
    [1, 2],
    [3, 4]
  ]);
  expect(getRadius.mock.calls.map(([row]) => row.radius)).toEqual([3, 5]);
  columns.destroy();
  device.destroy();
});

test('Scatterplot uses luma binary normalization and float-compatible scalar formats', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const buffers = vi.spyOn(device, 'createBuffer');
  const error = vi.fn();
  await columns.update(
    {
      ...props(),
      data: {
        length: 2,
        attributes: {
          getRadius: new Int32Array([3, 5]),
          getFillColor: new Uint16Array([65535, 0, 0, 65535, 0, 65535, 0, 65535])
        }
      }
    },
    () => {},
    error
  );
  expect(error).not.toHaveBeenCalled();
  const prepared = (columns as any).prepared.columns;
  expect(prepared.instanceRadius.format).toBe('float32');
  expect(prepared.instanceFillColors.format).toBe('unorm16x4');
  expect(
    buffers.mock.calls.some(
      ([options]) =>
        options!.data instanceof Float32Array &&
        Array.from(options!.data as Float32Array).join() === '3,5'
    )
  ).toBe(true);
  columns.destroy();
  device.destroy();
});

test('Scatterplot uses array rows directly without copying or iterating them', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const data = [{position: [1, 2]}, {position: [3, 4]}];
  data.slice = () => {
    throw new Error('copied row array');
  };
  data[Symbol.iterator] = () => {
    throw new Error('iterated row array');
  };
  const error = vi.fn();
  await columns.update(
    {
      ...props(),
      positions: undefined,
      radii: vectorFromArray([1, 2], new Float32()),
      data,
      getPosition: row => row.position
    },
    () => {},
    error
  );
  expect(error).not.toHaveBeenCalled();
  columns.destroy();
  device.destroy();
});

test('Scatterplot accesses Arrow table rows lazily without materializing them', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const data = new Table({radius: vectorFromArray([3, 5], new Float32())});
  const iterator = vi.spyOn(data, Symbol.iterator).mockImplementation(() => {
    throw new Error('materialized table');
  });
  const seen: number[] = [];
  const error = vi.fn();
  await columns.update(
    {
      ...props(),
      data,
      getRadius: row => {
        seen.push(row.radius);
        return row.radius;
      }
    },
    () => {},
    error
  );
  expect(error).not.toHaveBeenCalled();
  expect(seen).toEqual([3, 5]);
  expect(iterator).not.toHaveBeenCalled();
  columns.destroy();
  device.destroy();
});
