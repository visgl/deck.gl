// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {Table, tableFromArrays} from 'apache-arrow';
import {CSVLoader} from '@loaders.gl/tables/csv';
import ComponentState from '../../../../modules/core/src/lifecycle/component-state';
import Layer from '../../../../modules/core/src/lib/layer';
import LayerState from '../../../../modules/core/src/lib/layer-state';
import type {LayerProps} from '../../../../modules/core/src/types/layer-props';

async function* chunks(...values: unknown[]) {
  yield* values;
}

function makeState(props: Partial<LayerProps> = {}) {
  const layer = new Layer({id: 'stream', ...props});
  const state = new LayerState({layer, attributeManager: null});
  const progress = vi.spyOn(state as any, '_onProgress');
  const complete = vi.spyOn(state as any, '_onResolve');
  const error = vi.spyOn(state as any, '_onError').mockImplementation(() => {});
  state.setAsyncProps({data: []} as never);
  const run = (stream: AsyncIterable<unknown>) =>
    (state as any)._resolveAsyncIterable('data', stream) as Promise<void>;
  return {state, layer, progress, complete, error, run};
}

const first = tableFromArrays({x: [1, 2]});
const second = tableFromArrays({x: [3]});

for (const mode of ['auto', 'batched', 'snapshots'] as const) {
  test(`${mode}: Arrow chunks preserve column storage and report current data`, async () => {
    const callback = vi.fn();
    const {state, layer, run, complete, error} = makeState({
      _dataLoadingMode: mode,
      _onDataProgress: callback
    });
    await run(chunks(first.batches[0], second.batches[0]));
    const table = state.getAsyncProp('data') as Table;
    expect(Array.from(table.getChild('x')!)).toEqual(mode === 'snapshots' ? [3] : [1, 2, 3]);
    expect(table.batches.at(-1)).toBe(second.batches[0]);
    expect(callback.mock.calls.map(([data]) => data.numRows)).toEqual([
      2,
      mode === 'snapshots' ? 1 : 3
    ]);
    expect(callback.mock.calls[1][1]).toEqual({propName: 'data', layer});
    expect(complete).toHaveBeenCalledExactlyOnceWith('data', table);
    expect(error).not.toHaveBeenCalled();
  });
}

test('promised loaders.gl stream discards metadata and unwraps multiple Arrow batches', async () => {
  const {state, progress, complete} = makeState({_dataLoadingMode: 'batched'});
  const table = new Table([...first.batches, ...second.batches]);
  state.setAsyncProps({
    data: Promise.resolve(
      chunks({batchType: 'metadata', shape: 'metadata'}, {shape: 'arrow-table', data: table})
    )
  } as never);
  await vi.waitFor(() => expect(complete).toHaveBeenCalledOnce());
  expect(state.getAsyncProp('data').numRows).toBe(3);
  expect(progress).toHaveBeenCalledOnce();
  expect(state.getAsyncProp('data').batches[0]).toBe(first.batches[0]);
});

test('empty Arrow snapshot clears rows while preserving its schema', async () => {
  const {state, run} = makeState({_dataLoadingMode: 'snapshots'});
  await run(chunks(first.batches[0], {shape: 'arrow-table', data: new Table(first.schema)}));
  expect(state.getAsyncProp('data').numRows).toBe(0);
  expect(state.getAsyncProp('data').schema.fields[0].name).toBe('x');
});

test('row arrays and loader wrappers retain transforms and append ranges', async () => {
  const transform = vi.fn((rows, previous = []) => previous.concat(rows.map(x => x * 2)));
  const {state, run, progress} = makeState({dataTransform: transform});
  transform.mockClear();
  await run(chunks([1], {shape: 'object-row-table', data: [2]}, {shape: 'unknown', data: [3]}));
  expect(state.getAsyncProp('data')).toEqual([2, 4, 6]);
  expect(state.getAsyncProp('data').__diff).toEqual([{startRow: 2, endRow: 3}]);
  expect(transform).toHaveBeenCalledTimes(3);
  expect(progress).toHaveBeenCalledTimes(3);
});

test('empty and metadata-only streams complete without progress', async () => {
  for (const stream of [chunks(), chunks({batchType: 'metadata'})]) {
    const {state, run, progress, complete} = makeState();
    state.setAsyncProps({data: [9]} as never);
    await run(stream);
    expect(state.getAsyncProp('data')).toEqual([]);
    expect(state.isAsyncPropLoading('data')).toBe(false);
    expect(progress).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalledExactlyOnceWith('data', []);
  }
});

test('snapshot mode rejects row chunks through the layer error path', async () => {
  const {run, error, complete, progress} = makeState({_dataLoadingMode: 'snapshots'});
  await run(chunks([1]));
  expect(error).toHaveBeenCalledOnce();
  expect(complete).not.toHaveBeenCalled();
  expect(progress).not.toHaveBeenCalled();
});

test('iterator failures are reported for direct and promised streams', async () => {
  async function* fail() {
    yield [1];
    throw new Error('stream failed');
  }
  for (const promised of [false, true]) {
    const {state, error, complete} = makeState();
    state.setAsyncProps({data: promised ? Promise.resolve(fail()) : fail()} as never);
    await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
    expect(complete).not.toHaveBeenCalled();
  }
});

for (const finalized of [false, true]) {
  test(`pending stream is ignored after ${finalized ? 'finalization' : 'replacement'}`, async () => {
    let resume!: () => void;
    const gate = new Promise<void>(resolve => {
      resume = resolve;
    });
    async function* pending() {
      yield [1];
      await gate;
      yield [2];
    }
    const {state, run, progress, complete, error} = makeState();
    const done = run(pending());
    await vi.waitFor(() => expect(progress).toHaveBeenCalledOnce());
    if (finalized) state.finalize();
    else state.setAsyncProps({data: [9]} as never);
    resume();
    await done;
    expect(progress).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    if (!finalized) expect(state.getAsyncProp('data')).toEqual([9]);
  });
}

test('replacement during lazy Arrow import cannot publish data', async () => {
  const {state, run, progress, complete} = makeState();
  const done = run(chunks(first.batches[0]));
  // Allow the iterator to yield, then replace data while its Arrow import is pending.
  await Promise.resolve();
  state.setAsyncProps({data: [9]} as never);
  await done;
  expect(state.getAsyncProp('data')).toEqual([9]);
  expect(progress).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();
});

test('superseded promised streams and failures cannot notify the layer', async () => {
  const {state, progress, complete, error} = makeState();
  let reject!: (error: Error) => void;
  const failed = new Promise((_, rejectPromise) => {
    reject = rejectPromise;
  });
  state.setAsyncProps({data: failed} as never);
  state.setAsyncProps({data: Promise.resolve(chunks(first.batches[0]))} as never);
  state.setAsyncProps({data: [9]} as never);
  reject(new Error('obsolete'));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(state.getAsyncProp('data')).toEqual([9]);
  expect(progress).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

test('same URL reloads on mode and active batch options changes, retaining custom fetch', async () => {
  const fetch = vi.fn((_url: string, _context: unknown) => Promise.resolve(chunks([1])));
  const {state, layer, complete} = makeState({data: 'points.csv', fetch});
  state.setAsyncProps(layer.props);
  await vi.waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
  let current = layer;
  for (const [props, calls] of [
    [{_dataLoadingMode: 'batched'}, 2],
    [{opacity: 0.5}, 2],
    [{loadOptions: {csv: {delimiter: ';'}}}, 3],
    [{_dataLoadingMode: 'snapshots'}, 4],
    [{_dataLoadingMode: 'auto'}, 5]
  ] as const) {
    current = current.clone(props);
    state.setAsyncProps(current.props);
    expect(fetch).toHaveBeenCalledTimes(calls);
    if (!('opacity' in props)) {
      expect(fetch.mock.calls.at(-1)?.[1]).toEqual({propName: 'data', layer: current});
    }
  }
});

// Keep the base component path independent of Layer and its URL request tracking.
test('non-data async iterables remain untouched', async () => {
  const {layer} = makeState();
  const state = new ComponentState(layer);
  const stream = chunks([1]);
  state.setAsyncProps({image: stream} as never);
  expect(state.getAsyncProp('image')).toBe(stream);
});

test('URL loading consumes real CSV loader batches without metadata or wrappers', async () => {
  const {state, layer, complete, error, progress} = makeState({
    data: 'points.csv',
    _dataLoadingMode: 'batched',
    loaders: [CSVLoader],
    loadOptions: {
      core: {
        fetch: async () => new Response('x,y\n1,2\n3,4\n', {headers: {'content-type': 'text/csv'}}),
        metadata: true
      },
      csv: {shape: 'object-row-table'}
    }
  });
  layer.context = {resourceManager: {contains: () => false}} as never;
  state.setAsyncProps(layer.props);
  await vi.waitFor(() => {
    expect(error.mock.calls).toEqual([]);
    expect(complete).toHaveBeenCalledOnce();
  });
  expect(error).not.toHaveBeenCalled();
  expect(state.getAsyncProp('data')).toEqual([
    {x: 1, y: 2},
    {x: 3, y: 4}
  ]);
  expect(progress).toHaveBeenCalled();
  expect(progress.mock.calls.every(([, value]) => Array.isArray(value))).toBe(true);
});

test('mixed Arrow and row streams fail instead of discarding earlier rows', async () => {
  for (const values of [
    [[9], first.batches[0]],
    [first.batches[0], [9]]
  ]) {
    const {run, error, complete} = makeState();
    await run(chunks(...values));
    expect(error).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
  }
});

test('equivalent nested URL options do not restart an active batch load', async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  const fetch = vi.fn(async function* () {
    yield [1];
    await gate;
    yield [2];
  });
  const options = () => ({core: {fetch: {headers: {Authorization: 'token'}}}});
  const {layer, state, progress, complete} = makeState({
    data: 'points.csv',
    _dataLoadingMode: 'batched',
    loadOptions: options(),
    fetch
  });
  state.setAsyncProps(layer.props);
  await vi.waitFor(() => expect(progress).toHaveBeenCalledOnce());
  state.setAsyncProps(layer.clone({opacity: 0.5, loadOptions: options()}).props);
  release();
  expect(fetch).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(complete).toHaveBeenCalledExactlyOnceWith('data', [1, 2]));
});

test('replacing fetch Headers reloads an active batch URL', () => {
  const fetch = vi.fn(async function* () {
    yield [1];
  });
  const options = (token: string) => ({
    core: {fetch: {headers: new Headers({Authorization: token})}}
  });
  const {layer, state} = makeState({
    data: 'points.csv',
    _dataLoadingMode: 'batched',
    loadOptions: options('first'),
    fetch
  });
  state.setAsyncProps(layer.props);
  state.setAsyncProps(layer.clone({loadOptions: options('second')}).props);
  expect(fetch).toHaveBeenCalledTimes(2);
});
