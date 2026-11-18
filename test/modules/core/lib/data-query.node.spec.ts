// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {NullDevice} from '@luma.gl/core/test-utils';
import {LayerManager, Viewport} from '@deck.gl/core';
import {tableFromArrays} from 'apache-arrow';
import Layer from '../../../../modules/core/src/lib/layer';
import LayerState from '../../../../modules/core/src/lib/layer-state';
import {sqlParser} from '../../../../modules/core/src/arrow/upstream-math/sql-parser';

class QueryLayer extends Layer {
  static layerName = 'QueryLayer';
  initializeState() {}
}

test('query reloads a URL only when its query changes', async () => {
  const fetch = vi.fn(async () => new Response('value\n1\n2\n'));
  const props = {
    data: 'https://example.test/points.csv',
    loaders: [CSVLoader],
    loadOptions: {core: {fetch}}
  };
  const makeLayer = (query: string) => {
    const layer = new QueryLayer({...props, query});
    Object.assign(layer, {context: {}});
    return layer;
  };
  const first = makeLayer('SELECT value WHERE value = 1');
  const state = new LayerState({attributeManager: null, layer: first});
  state.setAsyncProps(first.props);

  await vi.waitFor(() => expect(state.getAsyncProp('data').getChild('value').get(0)).toBe(1));
  const initialFetchCount = fetch.mock.calls.length;
  expect(initialFetchCount).toBeGreaterThan(0);
  state.setAsyncProps(makeLayer('SELECT value WHERE value = 1').props);
  expect(fetch).toHaveBeenCalledTimes(initialFetchCount);

  state.setAsyncProps(makeLayer('SELECT value WHERE value = 2').props);
  await vi.waitFor(() => expect(state.getAsyncProp('data').getChild('value').get(0)).toBe(2));
  expect(fetch).toHaveBeenCalledTimes(2 * initialFetchCount);
});

test.each([false, true])('query works with Arrow table data (promised: %s)', async promised => {
  const table = tableFromArrays({value: [1, 2], label: ['first', 'second']});
  const data = promised ? Promise.resolve(table) : table;
  const parseQuery = vi.fn(sqlParser.parseQuery);
  const makeLayer = (query?: string) => {
    const layer = new QueryLayer({data, query});
    Object.assign(layer, {context: {sqlParser: {parseQuery}}});
    return layer;
  };
  const first = makeLayer('SELECT * FROM data WHERE value = 1');
  const state = new LayerState({attributeManager: null, layer: first});
  state.setAsyncProps(first.props);

  await vi.waitFor(() => expect(state.getAsyncProp('data').get(0)?.label).toBe('first'));
  state.setAsyncProps(makeLayer('SELECT * FROM data WHERE value = 1').props);
  expect(parseQuery).toHaveBeenCalledTimes(1);
  state.setAsyncProps(makeLayer('SELECT * WHERE value = 2').props);
  await vi.waitFor(() => expect(state.getAsyncProp('data').get(0)?.label).toBe('second'));
  state.setAsyncProps(makeLayer().props);
  await vi.waitFor(() => expect(state.getAsyncProp('data')).toBe(table));
});

test('layer query groups matching keys across Arrow record batches', async () => {
  const first = tableFromArrays({hex: ['a', 'b'], count: [2, 7]});
  const data = first.concat(tableFromArrays({hex: ['a'], count: [3]}));
  const layer = new QueryLayer({
    data,
    query: 'SELECT hex, SUM(count) AS visits FROM data GROUP BY hex ORDER BY hex'
  });
  Object.assign(layer, {context: {}});
  const state = new LayerState({attributeManager: null, layer});
  state.setAsyncProps(layer.props);
  await vi.waitFor(() =>
    expect(Array.from(state.getAsyncProp('data').getChild('visits'))).toEqual([5, 7])
  );
});

test.each([null, undefined])(
  'grouped query waits for data when initialized with %s',
  async data => {
    const device = new NullDevice({});
    const manager = new LayerManager(device, {viewport: new Viewport()});
    const onError = vi.fn();
    const layer = new QueryLayer({
      id: 'grouped',
      data,
      query: 'SELECT hex, SUM(count) AS visits FROM data GROUP BY hex',
      onError
    });
    try {
      manager.setLayers([layer]);
      await vi.waitFor(() => expect(layer.isLoaded).toBe(true));
      expect(layer.props.data).toEqual([]);
      const next = layer.clone({data: tableFromArrays({hex: ['a', 'a'], count: [2, 3]})});
      manager.setLayers([next]);
      await vi.waitFor(() => expect(next.isLoaded).toBe(true));
      expect((next.props.data as ReturnType<typeof tableFromArrays>).get(0)?.visits).toBe(5);
      expect(onError).not.toHaveBeenCalled();
    } finally {
      manager.finalize();
      device.destroy();
    }
  }
);

test('changing the query parser refreshes a reused layer', async () => {
  const device = new NullDevice({});
  const manager = new LayerManager(device, {viewport: new Viewport()});
  const data = tableFromArrays({value: [1, 2]});
  const onError = vi.fn();
  const layer = new QueryLayer({data, query: 'SELECT * WHERE value = 1', onError});
  try {
    manager.setLayers([layer]);
    expect(layer.isLoaded).toBe(false);
    await vi.waitFor(() => expect((layer.props.data as typeof data).get(0)?.value).toBe(1));

    const parseQuery = vi.fn(() => sqlParser.parseQuery('SELECT * WHERE value = 2'));
    manager.setProps({sqlParser: {parseQuery}});
    manager.updateLayers();
    await vi.waitFor(() => expect((layer.props.data as typeof data).get(0)?.value).toBe(2));
    manager.updateLayers();
    expect(parseQuery).toHaveBeenCalledOnce();

    manager.setProps({sqlParser: undefined});
    manager.updateLayers();
    await vi.waitFor(() => expect((layer.props.data as typeof data).get(0)?.value).toBe(1));
    expect(onError).not.toHaveBeenCalled();
  } finally {
    manager.finalize();
    device.destroy();
  }
});

test('URL queries use a custom fetch and refresh when it changes', async () => {
  const data = 'https://example.test/points';
  const query = 'SELECT * WHERE value > 0';
  const fetch = vi.fn(async () => tableFromArrays({value: [-1, 2]}));
  const replacement = vi.fn(async () => tableFromArrays({value: [-1, 3]}));
  const makeLayer = (load: typeof fetch) => {
    const layer = new QueryLayer({data, query, fetch: load});
    Object.assign(layer, {context: {sqlParser}});
    return layer;
  };
  const first = makeLayer(fetch);
  const state = new LayerState({attributeManager: null, layer: first});
  state.setAsyncProps(first.props);
  await vi.waitFor(() => expect(state.getAsyncProp('data').get(0)?.value).toBe(2));
  expect(fetch).toHaveBeenCalledExactlyOnceWith(data, {propName: 'data', layer: first});

  state.setAsyncProps(makeLayer(replacement).props);
  await vi.waitFor(() => expect(state.getAsyncProp('data').get(0)?.value).toBe(3));
  expect(replacement).toHaveBeenCalledOnce();
});

test('reactive bindings rerun only the dependent query stage', async () => {
  const data = tableFromArrays({value: [1, 2, 3]});
  const fetch = vi.fn(async () => data);
  const makeLayer = (lower: number, upper: number, unused = 0) => {
    const layer = new QueryLayer({
      data: 'points.arrow',
      fetch,
      dataQuery: 'SELECT * FROM data WHERE value >= :lower',
      reactiveQuery: 'SELECT * FROM data WHERE value <= :upper',
      reactiveQueryParameters: {lower, upper, unused}
    });
    Object.assign(layer, {context: {}});
    return layer;
  };
  const layer = makeLayer(1, 2);
  const state = new LayerState({attributeManager: null, layer});
  const values = () => Array.from(state.getAsyncProp('data').getChild('value'));
  state.setAsyncProps(layer.props);
  await vi.waitFor(() => expect(values()).toEqual([1, 2]));
  const first = state.getAsyncProp('data');
  state.setAsyncProps(makeLayer(1, 2, 99).props);
  expect(state.getAsyncProp('data')).toBe(first);
  state.setAsyncProps(makeLayer(1, 3).props);
  expect(values()).toEqual([1, 2, 3]);
  expect(fetch).toHaveBeenCalledTimes(1);
  state.setAsyncProps(makeLayer(2, 3).props);
  await vi.waitFor(() => expect(values()).toEqual([2, 3]));
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('layer props expose the current reactive result across layer replacements', async () => {
  const device = new NullDevice({});
  const manager = new LayerManager(device, {viewport: new Viewport()});
  const data = tableFromArrays({value: [1, 2]});
  const makeLayer = (minimum: number, reactiveQuery: string | null) =>
    new QueryLayer({
      id: 'reactive',
      data,
      reactiveQuery,
      reactiveQueryParameters: {minimum}
    });
  const sql = 'SELECT * FROM data WHERE value >= :minimum';
  try {
    const first = makeLayer(1, sql);
    manager.setLayers([first]);
    expect((first.props.data as typeof data).numRows).toBe(2);
    const next = makeLayer(2, sql);
    manager.setLayers([next]);
    expect((next.props.data as typeof data).get(0)?.value).toBe(2);
    const cleared = makeLayer(2, null);
    manager.setLayers([cleared]);
    expect(cleared.props.data).toBe(data);
  } finally {
    manager.finalize();
    device.destroy();
  }
});
