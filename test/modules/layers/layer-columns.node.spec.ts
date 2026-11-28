// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, Float64, vectorFromArray} from 'apache-arrow';
import {ArrowConverter} from '@deck.gl/core/arrow';
import {LayerColumns} from '../../../modules/core/src/lib/layer-columns';

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
  return {getPosition: positions(), data: [], getRadius: 1};
}

function makeColumns(device: NullDevice) {
  return new LayerColumns(
    device,
    {
      positions: {
        attribute: 'positions',
        accessor: 'getPosition',
        arrowAccessor: true,
        semantic: 'position',
        size: 3
      },
      radii: {
        attribute: 'radius',
        accessor: 'getRadius',
        arrowAccessor: true,
        semantic: 'scalar',
        size: 1
      }
    },
    'test'
  );
}

test('LayerColumns rejects mismatched columns without destroying the previous uploads', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const error = vi.fn();
  await columns.update(props(), () => {}, error);
  const old = (columns as any).prepared;
  const buffer = old.columns.positions.data[0].buffer;
  const buffers = vi.spyOn(device, 'createBuffer');
  await columns.update(
    {...props(), getRadius: vectorFromArray([1], new Float32())},
    () => {},
    error
  );
  expect(error).toHaveBeenCalledOnce();
  expect((columns as any).prepared).toBe(old);
  expect(buffer.destroyed).toBe(false);
  for (const result of buffers.mock.results) expect(result.value.destroyed).toBe(true);
  columns.destroy();
  device.destroy();
});

test('LayerColumns discards an upload superseded by a newer update', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
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
    const buffer = current.columns.positions.data[0].buffer;
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

test('LayerColumns waits for data and skips unrelated updates', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const input = props();
  const changed = vi.fn();
  const failed = vi.fn();
  const params = {props: input, oldProps: input, changeFlags: {}};
  const callbacks = {dataLoading: true, changed, failed};
  try {
    expect(columns.updateIfNeeded(params, callbacks)).toBeUndefined();
    expect(changed).not.toHaveBeenCalled();
    callbacks.dataLoading = false;
    await columns.updateIfNeeded(params, callbacks);
    expect(changed).toHaveBeenCalledOnce();
    expect(failed).not.toHaveBeenCalled();
    expect(columns.updateIfNeeded(params, callbacks)).toBeUndefined();
  } finally {
    columns.destroy();
    device.destroy();
  }
});

test('LayerColumns prepares accessor-only rows and clamps colors', async () => {
  const device = new NullDevice({});
  const columns = new LayerColumns(
    device,
    {
      colors: {attribute: 'colors', accessor: 'getColor', semantic: 'color', size: 4}
    },
    'test'
  );
  const failed = vi.fn();
  await columns.update({data: [{}, {}], getColor: [300, -1, 0, 255]}, () => {}, failed);
  expect(failed).not.toHaveBeenCalled();
  expect(columns.length).toBe(2);
  expect(Array.from((columns as any).prepared.columns.colors.value)).toEqual([255, 0, 0, 255]);
  expect((columns as any).prepared.chunkLengths).toEqual([2]);
  columns.destroy();
  device.destroy();
});

test('LayerColumns draw reports whether luma drew the batches', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const model = {setAttributeVectors: vi.fn(), drawBatches: vi.fn()};
  const draw = () => columns.draw(model as never, {} as never);
  try {
    expect(draw(), 'nothing to draw is complete').toBe(true);
    expect(model.drawBatches).not.toHaveBeenCalled();
    await columns.update(props(), () => {}, vi.fn());
    for (const drawn of [false, true]) {
      model.drawBatches.mockReturnValueOnce(drawn);
      expect(draw()).toBe(drawn);
    }
  } finally {
    columns.destroy();
    device.destroy();
  }
});

for (const mode of ['batched', 'snapshots'] as const) {
  test(`LayerColumns ${mode} controls GPU chunk retention`, async () => {
    const device = new NullDevice({});
    const columns = makeColumns(device);
    const failed = vi.fn();
    const first = positions();
    const input = {...props(), getPosition: first, _dataLoadOptions: mode};
    const convert = vi.spyOn(ArrowConverter.prototype, 'convert');
    try {
      await columns.update(input, () => {}, failed);
      const buffer = (columns as any).prepared.columns.positions.data[0].buffer;
      const destroy = vi.spyOn(buffer, 'destroy');
      const create = vi.spyOn(device, 'createBuffer');
      await columns.update({...input, getPosition: first.concat(positions())}, () => {}, failed);
      expect(failed).not.toHaveBeenCalled();
      const vector = (columns as any).prepared.columns.positions;
      expect(vector.length).toBe(4);
      expect(convert.mock.calls[1][0].length).toBe(mode === 'batched' ? 2 : 4);
      expect(vector.data[0].buffer === buffer).toBe(mode === 'batched');
      expect(buffer.destroyed).toBe(mode === 'snapshots');
      expect(create).toHaveBeenCalledTimes(mode === 'batched' ? 2 : 4);
      expect(columns.getBounds()).toEqual([
        [1, 2, 0],
        [3, 4, 0]
      ]);
      columns.destroy();
      expect(destroy).toHaveBeenCalledOnce();
      for (const result of create.mock.results) expect(result.value.destroyed).toBe(true);
    } finally {
      columns.destroy();
      vi.restoreAllMocks();
      device.destroy();
    }
  });
}

test('LayerColumns retains committed buffers after an invalid append and retries safely', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const failed = vi.fn();
  const first = positions();
  const input = {...props(), getPosition: first};
  try {
    await columns.update(input, () => {}, failed);
    const buffer = (columns as any).prepared.columns.positions.data[0].buffer;
    const create = vi.spyOn(device, 'createBuffer');
    const appended = first.concat(positions());
    await columns.update(
      {...input, getPosition: appended, getRadius: vectorFromArray([1])},
      () => {},
      failed
    );
    expect(failed).toHaveBeenCalledOnce();
    expect(buffer.destroyed).toBe(false);
    for (const result of create.mock.results) expect(result.value.destroyed).toBe(true);
    await columns.update({...input, getPosition: appended}, () => {}, failed);
    expect((columns as any).prepared.columns.positions.data[0].buffer).toBe(buffer);
    expect(columns.length).toBe(4);
    await columns.update({...input, getPosition: positions()}, () => {}, failed);
    expect(buffer.destroyed).toBe(true);
    expect(columns.length).toBe(2);
  } finally {
    columns.destroy();
    vi.restoreAllMocks();
    device.destroy();
  }
});

test('LayerColumns reuses unchanged Arrow inputs without reading rows or uploading buffers', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const get = vi.fn();
  const input = {...props(), data: {numRows: 2, get}};
  const failed = vi.fn();
  try {
    await columns.update(input, () => {}, failed);
    const create = vi.spyOn(device, 'createBuffer');
    await columns.update({...input, getRadius: 2}, () => {}, failed);
    expect(failed).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(columns.getBounds()).toEqual([
      [1, 2, 0],
      [3, 4, 0]
    ]);
  } finally {
    columns.destroy();
    vi.restoreAllMocks();
    device.destroy();
  }
});

test('LayerColumns abandons only new allocations when an append is superseded', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const failed = vi.fn();
  const first = positions();
  const second = first.concat(positions());
  const input = {...props(), getPosition: first};
  let resume!: () => void;
  const gate = new Promise<void>(resolve => {
    resume = resolve;
  });
  try {
    await columns.update(input, () => {}, failed);
    const retained = (columns as any).prepared.columns.positions.data[0].buffer;
    const convert = ArrowConverter.prototype.convert;
    let calls = 0;
    vi.spyOn(ArrowConverter.prototype, 'convert').mockImplementation(async function (
      this: ArrowConverter,
      ...args
    ) {
      if (++calls === 1) await gate;
      return convert.apply(this, args);
    });
    const older = columns.update({...input, getPosition: second}, () => {}, failed);
    // Wait until the older conversion reaches its controlled suspension point.
    await vi.waitFor(() => expect(calls).toBe(1));
    await columns.update({...input, getPosition: second.concat(positions())}, () => {}, failed);
    const committed = (columns as any).prepared;
    const create = vi.spyOn(device, 'createBuffer');
    resume();
    await older;
    expect(failed).not.toHaveBeenCalled();
    expect((columns as any).prepared).toBe(committed);
    expect(committed.columns.positions.data[0].buffer).toBe(retained);
    expect(retained.destroyed).toBe(false);
    for (const result of create.mock.results) expect(result.value.destroyed).toBe(true);
  } finally {
    resume();
    columns.destroy();
    vi.restoreAllMocks();
    device.destroy();
  }
});

test('LayerColumns appends float64 residuals and colors with only new upload bytes', async () => {
  const device = new NullDevice({});
  const columns = new LayerColumns(
    device,
    {
      positions: {
        attribute: 'positions',
        accessor: 'getPosition',
        arrowAccessor: true,
        semantic: 'position',
        size: 3
      },
      colors: {
        attribute: 'colors',
        accessor: 'getColor',
        arrowAccessor: true,
        semantic: 'color',
        size: 4
      }
    },
    'test'
  );
  const point = vectorFromArray(
    [[123.123456789, 45.987654321]],
    new FixedSizeList(2, new Field('values', new Float64(), false))
  );
  const color = vectorFromArray(
    [[1, 0, 0, 1]],
    new FixedSizeList(4, new Field('values', new Float32(), false))
  );
  const failed = vi.fn();
  const input = {data: [], getPosition: point, getColor: color};
  try {
    await columns.update(input, () => {}, failed, {fp64: true});
    expect(failed).not.toHaveBeenCalled();
    const first = (columns as any).prepared.columns;
    const create = vi.spyOn(device, 'createBuffer');
    await columns.update(
      {...input, getPosition: point.concat(point), getColor: color.concat(color)},
      () => {},
      failed,
      {fp64: true}
    );
    expect(failed).not.toHaveBeenCalled();
    const next = (columns as any).prepared.columns;
    for (const name of ['positions', 'positions64Low', 'colors']) {
      expect(next[name].data[0]).toBe(first[name].data[0]);
      expect(next[name].data.map(chunk => chunk.length)).toEqual([1, 1]);
    }
    // One float32x3 high, one float32x3 low, and one unorm8x4 color.
    expect(create.mock.results.reduce((bytes, result) => bytes + result.value.byteLength, 0)).toBe(
      28
    );
    await columns.update({...input, coordinateOrigin: [1, 2, 3]}, () => {}, failed, {fp64: true});
    expect(first.positions.data[0].buffer.destroyed).toBe(true);
    expect(failed).not.toHaveBeenCalled();
  } finally {
    columns.destroy();
    vi.restoreAllMocks();
    device.destroy();
  }
});

test('LayerColumns honors trigger changes when dataChanged suppresses the trigger flag', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const failed = vi.fn();
  const input = {...props(), updateTriggers: {getPosition: [1]}};
  try {
    await columns.update(input, () => {}, failed);
    const buffer = (columns as any).prepared.columns.positions.data[0].buffer;
    input.getPosition.data[0].children[0].values[0] = 9;
    await columns.updateIfNeeded(
      {
        props: {...input, data: [], updateTriggers: {getPosition: [2]}},
        oldProps: input,
        changeFlags: {dataChanged: true}
      },
      {dataLoading: false, changed() {}, failed}
    );
    expect(failed).not.toHaveBeenCalled();
    expect(buffer.destroyed).toBe(true);
    expect(columns.getBounds()).toEqual([
      [3, 2, 0],
      [9, 4, 0]
    ]);
  } finally {
    columns.destroy();
    device.destroy();
  }
});

test('LayerColumns keeps invalidation until a superseding append commits', async () => {
  const device = new NullDevice({});
  const columns = makeColumns(device);
  const failed = vi.fn();
  const input = props();
  let resume!: () => void;
  const gate = new Promise<void>(resolve => {
    resume = resolve;
  });
  try {
    await columns.update(input, () => {}, failed);
    const buffer = (columns as any).prepared.columns.positions.data[0].buffer;
    const convert = ArrowConverter.prototype.convert;
    let calls = 0;
    const spy = vi.spyOn(ArrowConverter.prototype, 'convert').mockImplementation(async function (
      this: ArrowConverter,
      ...args
    ) {
      if (++calls === 1) await gate;
      return convert.apply(this, args);
    });
    const refresh = columns.update(input, () => {}, failed, {}, undefined, false);
    await vi.waitFor(() => expect(calls).toBe(1));
    await columns.update(
      {...input, getPosition: input.getPosition.concat(positions())},
      () => {},
      failed
    );
    expect(spy.mock.calls[1][0].length).toBe(4);
    expect(buffer.destroyed).toBe(true);
    resume();
    await refresh;
    expect(columns.length).toBe(4);
    expect(failed).not.toHaveBeenCalled();
  } finally {
    resume();
    columns.destroy();
    vi.restoreAllMocks();
    device.destroy();
  }
});
