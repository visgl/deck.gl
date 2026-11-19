// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {createRequire} from 'node:module';
import {Field, Float64, Table, tableFromArrays} from 'apache-arrow';
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
  complete.mockClear();
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
      _dataLoadOptions: mode,
      onDataProgress: callback
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
  const {state, progress, complete} = makeState({_dataLoadOptions: 'batched'});
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
  const {state, run} = makeState({_dataLoadOptions: 'snapshots'});
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
    complete.mockClear();
    await run(stream);
    expect(state.getAsyncProp('data')).toEqual([]);
    expect(state.isAsyncPropLoading('data')).toBe(false);
    expect(progress).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalledExactlyOnceWith('data', []);
  }
});

test('snapshot mode rejects row chunks through the layer error path', async () => {
  const {run, error, complete, progress} = makeState({_dataLoadOptions: 'snapshots'});
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
    if (finalized) {
      expect(complete).not.toHaveBeenCalled();
    } else {
      expect(complete).toHaveBeenCalledExactlyOnceWith('data', [9]);
      expect(state.getAsyncProp('data')).toEqual([9]);
    }
    expect(error).not.toHaveBeenCalled();
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
  expect(complete).toHaveBeenCalledExactlyOnceWith('data', [9]);
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
  expect(complete).toHaveBeenCalledExactlyOnceWith('data', [9]);
  expect(error).not.toHaveBeenCalled();
});

test('same URL reloads on mode and active batch options changes, retaining custom fetch', async () => {
  const fetch = vi.fn((_url: string, _context: unknown) => Promise.resolve(chunks([1])));
  const {state, layer, complete} = makeState({data: 'points.csv', fetch});
  state.setAsyncProps(layer.props);
  await vi.waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
  let current = layer;
  for (const [props, calls] of [
    [{_dataLoadOptions: 'batched'}, 2],
    [{opacity: 0.5}, 2],
    [{loadOptions: {csv: {delimiter: ';'}}}, 3],
    [{_dataLoadOptions: 'snapshots'}, 4],
    [{_dataLoadOptions: 'auto'}, 5]
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
    _dataLoadOptions: 'batched',
    loaders: [CSVLoader],
    loadOptions: {
      core: {
        fetch: async () => new Response('x,y\n1,2\n3,4\n', {headers: {'content-type': 'text/csv'}}),
        metadata: true
      },
      csv: {shape: 'object-row-table'}
    }
  });
  layer.context = {resourceManager: {contains: () => false, unsubscribe: vi.fn()}} as never;
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
    _dataLoadOptions: 'batched',
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
    _dataLoadOptions: 'batched',
    loadOptions: options('first'),
    fetch
  });
  state.setAsyncProps(layer.props);
  state.setAsyncProps(layer.clone({loadOptions: options('second')}).props);
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('a bare Arrow table replaces the previous snapshot with all its batches', async () => {
  const {state, run, progress} = makeState({_dataLoadOptions: 'snapshots'});
  const replacement = new Table([...second.batches, ...first.batches]);
  await run(chunks(first.batches[0], replacement));
  expect(Array.from(state.getAsyncProp('data').getChild('x'))).toEqual([3, 1, 2]);
  expect(progress.mock.calls[1][1]).toBeInstanceOf(Table);
});

test('complete loading exposes a bare Arrow table to layer props and callbacks', async () => {
  const dataTransform = vi.fn(<T>(value: unknown) => value as T);
  const {state, complete} = makeState({dataTransform});
  state.setAsyncProps({
    data: Promise.resolve({shape: 'arrow-table', data: first})
  } as never);
  await vi.waitFor(() => expect(complete).toHaveBeenCalledExactlyOnceWith('data', first));
  expect(state.getAsyncProp('data')).toBe(first);
  expect(dataTransform).toHaveBeenLastCalledWith(first);
});

test('appends batches from a separate Arrow runtime without copying column buffers', async () => {
  const foreignArrow = createRequire(import.meta.url)(
    'apache-arrow'
  ) as typeof import('apache-arrow');
  const foreign = foreignArrow.tableFromArrays({x: [7, 8]});
  expect(Object.getPrototypeOf(foreign)).not.toBe(Table.prototype);
  const {state, run, error} = makeState({_dataLoadOptions: 'batched'});
  await run(chunks(first.batches[0], foreign.batches[0], {shape: 'arrow-table', data: foreign}));
  expect(error).not.toHaveBeenCalled();
  const table = state.getAsyncProp('data') as Table;
  expect(Array.from(table.getChild('x')!)).toEqual([1, 2, 7, 8, 7, 8]);
  expect(table.batches[1].data.children[0].values.buffer).toBe(
    foreign.batches[0].data.children[0].values.buffer
  );
});

test('empty snapshots from another Arrow runtime retain local field and type identities', async () => {
  const foreignArrow = createRequire(import.meta.url)(
    'apache-arrow'
  ) as typeof import('apache-arrow');
  const foreign = new foreignArrow.Table(foreignArrow.tableFromArrays({x: [1]}).schema);
  const {state, run, error} = makeState({_dataLoadOptions: 'snapshots'});
  await run(chunks(first, foreign));
  expect(error).not.toHaveBeenCalled();
  const table = state.getAsyncProp('data') as Table;
  expect(table.numRows).toBe(0);
  expect(table.schema.fields[0]).toBeInstanceOf(Field);
  expect(table.schema.fields[0].type).toBeInstanceOf(Float64);
});

test('new direct data reports its transformed value once', () => {
  const rows = [{x: 1}, {x: 2}];
  const onDataLoad = vi.fn((value, {layer}) => {
    expect(layer.props.data).toBe(value);
  });
  const dataTransform = vi.fn(<T>(value: unknown) => {
    const input = value as {x: number}[];
    return tableFromArrays({x: input.map(row => row.x * 2)}) as T;
  });
  const layer = new Layer({data: rows, dataTransform, onDataLoad});
  const state = new LayerState({layer, attributeManager: null});
  state.setAsyncProps(layer.props);
  expect(onDataLoad).toHaveBeenCalledExactlyOnceWith(layer.props.data, {propName: 'data', layer});
  expect(Array.from((layer.props.data as Table).getChild('x')!)).toEqual([2, 4]);

  const unchanged = new Layer({data: rows, dataTransform, onDataLoad});
  state.setAsyncProps(unchanged.props);
  expect(dataTransform).toHaveBeenCalledOnce();
  expect(onDataLoad).toHaveBeenCalledOnce();

  const next = new Layer({data: [{x: 3}], dataTransform, onDataLoad});
  state.setAsyncProps(next.props);
  expect(onDataLoad).toHaveBeenCalledTimes(2);
  expect(onDataLoad).toHaveBeenLastCalledWith(next.props.data, {propName: 'data', layer: next});
});

test('row streams await each transform before pulling the next batch', async () => {
  const gate = Promise.withResolvers<number[]>();
  const transform = vi.fn((rows, previous = []) =>
    rows[0] === 1 ? gate.promise : previous.concat(rows)
  );
  const {state, run, progress} = makeState({dataTransform: transform});
  const stream = run(chunks([1], [2]));
  await vi.waitFor(() => expect(transform).toHaveBeenLastCalledWith([1], []));
  expect(state.isAsyncPropLoading('data')).toBe(true);
  expect(progress).not.toHaveBeenCalled();
  gate.resolve([10]);
  await stream;
  expect(state.isAsyncPropLoading('data')).toBe(false);
  expect(state.getAsyncProp('data')).toEqual([10, 2]);
});

test('an obsolete transform cannot publish data or report an error', async () => {
  const gate = Promise.withResolvers<number[]>();
  const transform = vi.fn(rows => (rows[0] === 1 ? gate.promise : rows));
  const {state, complete, error} = makeState({dataTransform: transform});
  state.setAsyncProps({data: Promise.resolve([1])} as never);
  await vi.waitFor(() => expect(transform).toHaveBeenLastCalledWith([1]));
  state.setAsyncProps({data: [2]} as never);
  gate.reject(new Error('obsolete'));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(state.getAsyncProp('data')).toEqual([2]);
  expect(complete).toHaveBeenCalledExactlyOnceWith('data', [2]);
  expect(error).not.toHaveBeenCalled();
});

test('a rejected transform clears loading and reports the error', async () => {
  const failure = new Error('transform failed');
  const {state, complete, error} = makeState({
    dataTransform: vi.fn(rows => (rows.length ? Promise.reject(failure) : rows))
  });
  state.setAsyncProps({data: Promise.resolve([1])} as never);
  await vi.waitFor(() => expect(error).toHaveBeenCalledExactlyOnceWith('data', failure));
  expect(state.isAsyncPropLoading('data')).toBe(false);
  expect(complete).not.toHaveBeenCalled();
});
