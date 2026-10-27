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
