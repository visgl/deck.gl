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
