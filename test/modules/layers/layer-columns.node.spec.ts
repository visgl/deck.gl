// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
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
