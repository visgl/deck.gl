// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float64, Float32, vectorFromArray} from 'apache-arrow';
import {ColumnLayerColumns} from '../../../modules/layers/src/column-layer/column-layer-columns';

const positions = () =>
  vectorFromArray(
    [
      [0, 0],
      [1, 1]
    ],
    new FixedSizeList(2, new Field('value', new Float64(), false))
  );
const props = () => ({
  data: [],
  positions: positions(),
  getElevation: 1000,
  getFillColor: [0, 0, 0, 255],
  getLineColor: [0, 0, 0, 255],
  getLineWidth: 1
});

test('Column conversion preserves accessor fallbacks and cleans up failed replacements', async () => {
  const device = new NullDevice({});
  const columns = new ColumnLayerColumns(device);
  const failed = vi.fn();
  await columns.update(props(), () => {}, failed, {fp64: true});
  expect(failed).not.toHaveBeenCalled();
  expect(columns.length).toBe(2);
  const previous = (columns as any).prepared;
  expect(Array.from(previous.columns.instanceElevations.value)).toEqual([1000]);
  expect(previous.columns.instancePositions64Low).toBeTruthy();
  await columns.update(
    {...props(), elevations: vectorFromArray([1], new Float32())},
    () => {},
    failed
  );
  expect(failed).toHaveBeenCalledOnce();
  expect((columns as any).prepared).toBe(previous);
  const buffer = previous.columns.instancePositions.data[0].buffer;
  expect(buffer.destroyed).toBe(false);
  columns.destroy();
  expect(buffer.destroyed).toBe(true);
  device.destroy();
});

test('Column rejects mismatched chunk structures even when lengths match', async () => {
  const device = new NullDevice({});
  const columns = new ColumnLayerColumns(device);
  const failed = vi.fn();
  await columns.update(
    {
      ...props(),
      positions: positions().concat(positions()),
      elevations: vectorFromArray([1, 2, 3, 4], new Float32())
    },
    () => {},
    failed
  );
  expect(failed).toHaveBeenCalledOnce();
  expect(columns.length).toBe(0);
  columns.destroy();
  device.destroy();
});
