// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {tableFromArrays, Table} from 'apache-arrow';
import ComponentState from '../../../../modules/core/src/lifecycle/component-state';

function makeState(queryOutput: 'batches' | 'snapshots') {
  const state = new ComponentState({props: {queryOutput}} as never);
  // Exercise the async data prop boundary without a GPU device.
  (state as any)._createAsyncPropData('data', []);
  return state;
}

async function* recordBatches() {
  yield tableFromArrays({x: [1, 2]}).batches[0];
  yield tableFromArrays({x: [3]}).batches[0];
}

test('queryOutput batches appends Arrow batches without converting them to rows', async () => {
  const state = makeState('batches');
  await (state as any)._resolveAsyncIterable('data', recordBatches());
  const data = state.getAsyncProp('data');
  expect(data).toBeInstanceOf(Table);
  expect(data.getChild('x')?.toArray()).toEqual(Int32Array.from([1, 2, 3]));
});

test('queryOutput snapshots replaces the previous Arrow table', async () => {
  const state = makeState('snapshots');
  await (state as any)._resolveAsyncIterable('data', recordBatches());
  const data = state.getAsyncProp('data');
  expect(data).toBeInstanceOf(Table);
  expect(data.numRows).toBe(1);
  expect(data.getChild('x')?.get(0)).toBe(3);
});
