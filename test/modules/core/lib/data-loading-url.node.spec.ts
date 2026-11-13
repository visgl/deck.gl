// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {load, loadInBatches} from '@loaders.gl/core';
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
    const layer = new Layer({id: 'load', _dataLoadingMode: mode, loaders, loadOptions});
    const resourceManager = {contains: vi.fn(() => false), add: vi.fn()};
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
  const layer = new Layer({id: 'load', _dataLoadingMode: 'batched', loadOptions: {}});
  layer.context = {resourceManager: {contains: () => false}} as never;
  layer.props.fetch!('image.png', {propName: 'image', layer});
  expect(load).toHaveBeenCalledOnce();
  expect(loadInBatches).not.toHaveBeenCalled();
});
