// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi, afterEach} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {Tile2DLayer} from '@deck.gl/proposals/layers';

afterEach(() => {
  vi.unstubAllGlobals();
});

const viewState = {longitude: -77.06753216318891, latitude: 38.94628276371387};
// Selects tile 1171-1566-12, with coverage ancestors 585-783-11 and 0-0-0
const singleTileViewport = new WebMercatorViewport({...viewState, zoom: 12, width: 1, height: 1});
// Selects four zoom 12 tiles, whose coverage ancestors are hidden
const fourTilesViewport = new WebMercatorViewport({
  ...viewState,
  zoom: 12,
  width: 600,
  height: 600
});

const tileProps = {
  data: 'tiles/{z}/{x}/{y}.json',
  getTileData: () => ({}),
  lodStrategy: 'coverage',
  renderSubLayers: props => new ScatterplotLayer({id: props.id})
} as const;

/** Runs the layer lifecycle without a deck and returns the ids of tiles with sublayers. */
async function setup(layer: TileLayer | Tile2DLayer, viewport: WebMercatorViewport) {
  const requestAnimationFrame = vi.fn(() => 1);
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  layer.context = {viewport, layerManager: {getViewports: () => [viewport]}} as any;
  layer.initializeState();
  layer.setState = (updates: any) => Object.assign(layer.state, updates);
  layer.setNeedsUpdate = vi.fn();
  layer.updateState({changeFlags: {dataChanged: true}} as any);
  const {tileset} = layer.state;
  await vi.waitFor(() => expect(tileset!.tiles.every(tile => tile.isLoaded)).toBe(true));
  layer.updateState({changeFlags: {}} as any);

  const getCreatedIds = () => {
    layer.renderLayers();
    return tileset!.tiles
      .filter(tile =>
        layer instanceof TileLayer ? tile.layers : layer.state.tileLayers.has(tile.id)
      )
      .map(tile => tile.id);
  };
  return {getCreatedIds, requestAnimationFrame};
}

for (const Layer of [TileLayer, Tile2DLayer]) {
  test(`${Layer.layerName}#_maxNewTilesPerFrame creates hidden tiles on later frames`, async () => {
    const layer = new Layer({...tileProps, _maxNewTilesPerFrame: 2});
    const {getCreatedIds, requestAnimationFrame} = await setup(layer, singleTileViewport);

    expect(getCreatedIds(), 'the visible tile, then the closest coverage').toEqual([
      '585-783-11',
      '1171-1566-12'
    ]);
    expect(requestAnimationFrame, 'requests the next batch').toHaveBeenCalledOnce();

    // The frame request clears its id before updating the layer
    layer.state.nextTilesFrame = undefined;
    expect(getCreatedIds(), 'creates the rest next frame').toEqual([
      '0-0-0',
      '585-783-11',
      '1171-1566-12'
    ]);
    expect(requestAnimationFrame, 'nothing left to defer').toHaveBeenCalledOnce();
    layer.finalizeState();
  });

  test(`${Layer.layerName}#_maxNewTilesPerFrame never defers visible tiles`, async () => {
    const layer = new Layer({...tileProps, _maxNewTilesPerFrame: 1});
    const {getCreatedIds} = await setup(layer, fourTilesViewport);
    const createdIds = getCreatedIds();

    expect(
      createdIds.filter(id => id.endsWith('-12')).length,
      'every visible tile is created'
    ).toBe(4);
    expect(createdIds.length, 'one hidden tile is created although visible tiles fill the limit').toBe(
      5
    );
    layer.state.nextTilesFrame = undefined;
    expect(getCreatedIds().length, 'one more tile next frame').toBe(6);
    layer.finalizeState();
  });
}
