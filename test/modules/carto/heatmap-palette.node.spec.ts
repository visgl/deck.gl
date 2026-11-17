// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import HeatmapTileLayer from '@deck.gl/carto/layers/heatmap-tile-layer';

test('HeatmapTileLayer packs normalized palette entries for its byte texture', () => {
  const createTexture = vi.fn(() => ({destroy: vi.fn()}));
  const layer = new HeatmapTileLayer();
  const state = {};
  Object.assign(layer, {state, context: {device: {createTexture}}});
  vi.spyOn(layer, 'setState').mockImplementation(update => {
    Object.assign(state, update);
  });
  const colorRange = [[1, 0.5, 0, 0], new Uint8Array([16, 32, 64])];
  layer._updateColorTexture({props: {colorRange}}, true);
  expect(createTexture).toHaveBeenCalledWith(
    expect.objectContaining({
      data: new Uint8Array([255, 128, 0, 0, 16, 32, 64, 255])
    })
  );
});
