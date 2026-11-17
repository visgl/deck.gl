// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import HeatmapTileLayer from '@deck.gl/carto/layers/heatmap-tile-layer';

test('HeatmapTileLayer refreshes palette bytes when the Deck convention changes', () => {
  const createTexture = vi.fn((_options: {data: Uint8Array}) => ({destroy: vi.fn()}));
  const layer = new HeatmapTileLayer();
  const state = {scheme: null};
  const context = {normalizedColors: true, device: {createTexture}};
  Object.assign(layer, {state, context});
  vi.spyOn(layer, 'setState').mockImplementation(update => {
    Object.assign(state, update);
  });
  const updatePalette = (props = layer.props, oldProps = props) => {
    layer.updateState({props, oldProps, changeFlags: {}} as Parameters<
      typeof layer.updateState
    >[0]);
  };

  updatePalette();
  const textureData = () => createTexture.mock.lastCall![0].data;
  expect(textureData().slice(0, 4)).toEqual(new Uint8Array([255, 255, 178, 255]));

  const props = {
    ...layer.props,
    colorRange: [[1, 0.5, 0, 0], new Uint8Array([16, 32, 64])]
  } as typeof layer.props;
  updatePalette(props, layer.props);
  const normalized = new Uint8Array([255, 128, 0, 0, 16, 32, 64, 255]);
  expect(textureData()).toEqual(normalized);

  context.normalizedColors = false;
  updatePalette(props);
  expect(textureData()).toEqual(new Uint8Array([1, 0, 0, 0, 16, 32, 64, 255]));

  context.normalizedColors = true;
  updatePalette(props);
  expect(textureData()).toEqual(normalized);
});
