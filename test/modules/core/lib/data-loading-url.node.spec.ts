// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {load, loadInBatches} from '@loaders.gl/core';
import ResourceManager from '../../../../modules/core/src/lib/resource/resource-manager';
import Layer from '../../../../modules/core/src/lib/layer';

vi.mock('@loaders.gl/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@loaders.gl/core')>()),
  load: vi.fn(),
  loadInBatches: vi.fn()
}));
afterEach(() => vi.clearAllMocks());

for (const mode of ['auto', 'batched', 'snapshots'] as const) {
  test(`${mode} chooses URL loader and forwards options`, () => {
    const loaders = [];
    const loadOptions = {csv: {delimiter: ';'}};
    const layer = new Layer({id: 'load', _dataLoadOptions: mode, loaders, loadOptions});
    const resourceManager = {contains: vi.fn(() => false), add: vi.fn(), unsubscribe: vi.fn()};
    layer.context = {resourceManager} as never;
    const controller = new AbortController();
    layer.props.fetch!('points.csv', {propName: 'data', layer, signal: controller.signal});
    const selected = mode === 'auto' ? load : loadInBatches;
    const other = mode === 'auto' ? loadInBatches : load;
    expect(selected).toHaveBeenCalledExactlyOnceWith('points.csv', loaders, {
      ...loadOptions,
      core: {fetch: {signal: controller.signal}}
    });
    expect(other).not.toHaveBeenCalled();
    expect(resourceManager.add).not.toHaveBeenCalled();
  });
}

test('batch loading is limited to the data prop', () => {
  const layer = new Layer({id: 'load', _dataLoadOptions: 'batched', loadOptions: {}});
  layer.context = {resourceManager: {contains: () => false}} as never;
  layer.props.fetch!('image.png', {propName: 'image', layer});
  expect(load).toHaveBeenCalledOnce();
  expect(loadInBatches).not.toHaveBeenCalled();
});

test('streaming detaches the old data subscription and preserves other requests', () => {
  const resourceManager = new ResourceManager({device: {} as never});
  const layer = new Layer({id: 'load', _dataLoadOptions: 'batched'});
  layer.context = {resourceManager} as never;
  const onData = vi.fn();
  const onImage = vi.fn();
  resourceManager.add({resourceId: 'points.csv', data: [1]});
  resourceManager.add({resourceId: 'image.png', data: 'first'});
  resourceManager.subscribe({
    consumerId: layer.id,
    requestId: 'data',
    resourceId: 'points.csv',
    onChange: onData
  });
  resourceManager.subscribe({
    consumerId: layer.id,
    requestId: 'image',
    resourceId: 'image.png',
    onChange: onImage
  });
  layer.props.fetch!('points.csv', {propName: 'data', layer});
  resourceManager.add({resourceId: 'points.csv', data: [2]});
  resourceManager.add({resourceId: 'image.png', data: 'second'});
  expect(onData).not.toHaveBeenCalled();
  expect(onImage).toHaveBeenCalledWith('second');
  resourceManager.finalize();
});
