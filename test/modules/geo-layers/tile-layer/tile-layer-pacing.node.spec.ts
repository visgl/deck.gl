// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi, afterEach, type Mock} from 'vitest';
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
// Selects tile 1-1-1, which no view needs after a move to the viewports above
const otherTileViewport = new WebMercatorViewport({
  longitude: 100,
  latitude: -40,
  zoom: 1,
  width: 1,
  height: 1
});

const tileProps = {
  data: 'tiles/{z}/{x}/{y}.json',
  getTileData: () => ({}),
  lodStrategy: 'coverage',
  renderSubLayers: props => new ScatterplotLayer({id: props.id})
} as const;

/** Runs the layer lifecycle without a deck and returns the ids of tiles with sublayers. */
async function setup(
  layer: TileLayer | Tile2DLayer,
  viewports: WebMercatorViewport[]
): Promise<{
  getCreatedIds: () => string[];
  runFrame: () => void;
  requestAnimationFrame: Mock;
  cancelAnimationFrame: Mock;
}> {
  const frames: FrameRequestCallback[] = [];
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => frames.push(callback));
  const cancelAnimationFrame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  let viewport = viewports[0];
  layer.context = {viewport, layerManager: {getViewports: () => [viewport]}} as any;
  layer.initializeState();
  layer.setState = (updates: any) => Object.assign(layer.state, updates);
  layer.setNeedsUpdate = vi.fn();
  // Without a layer manager, the frame request updates this layer
  layer.getCurrentLayer = () => layer as any;
  let changeFlags: any = {dataChanged: true};
  for (viewport of viewports) {
    layer.context.viewport = viewport;
    layer.updateState({changeFlags} as any);
    const {tileset} = layer.state;
    await vi.waitFor(() => expect(tileset!.tiles.every(tile => tile.isLoaded)).toBe(true));
    changeFlags = {viewportChanged: true};
  }
  layer.updateState({changeFlags: {}} as any);
  const {tileset} = layer.state;

  const getCreatedIds = () => {
    layer.renderLayers();
    return tileset!.tiles
      .filter(tile =>
        layer instanceof TileLayer ? tile.layers : layer.state.tileLayers.has(tile.id)
      )
      .map(tile => tile.id);
  };
  // Runs the pending frame request, as the browser does before the next frame
  const runFrame = () => {
    expect(frames, 'one frame request is pending').toHaveLength(1);
    frames.pop()!(0);
  };
  return {getCreatedIds, runFrame, requestAnimationFrame, cancelAnimationFrame};
}

for (const Layer of [TileLayer, Tile2DLayer]) {
  test(`${Layer.layerName}#_maxNewTilesPerFrame creates hidden tiles on later frames`, async () => {
    const layer = new Layer({...tileProps, _maxNewTilesPerFrame: 2});
    const {getCreatedIds, runFrame, requestAnimationFrame, cancelAnimationFrame} = await setup(
      layer,
      [otherTileViewport, singleTileViewport]
    );

    expect(getCreatedIds(), 'the visible tile, then the closest coverage').toEqual([
      '585-783-11',
      '1171-1566-12'
    ]);
    expect(requestAnimationFrame, 'requests the next batch').toHaveBeenCalledOnce();

    vi.mocked(layer.setNeedsUpdate).mockClear();
    runFrame();
    expect(layer.setNeedsUpdate, 'the frame request updates the layer').toHaveBeenCalledOnce();
    expect(layer.state.nextTilesFrame, 'the frame request clears its id').toBeUndefined();
    expect(getCreatedIds(), 'creates the rest, the tile no view needs last').toEqual([
      '0-0-0',
      '1-1-1',
      '585-783-11',
      '1171-1566-12'
    ]);
    expect(requestAnimationFrame, 'nothing left to defer').toHaveBeenCalledOnce();
    layer.finalizeState();
    expect(cancelAnimationFrame, 'no frame request to cancel').not.toHaveBeenCalled();
  });

  test(`${Layer.layerName}#_maxNewTilesPerFrame never defers visible tiles`, async () => {
    const layer = new Layer({...tileProps, _maxNewTilesPerFrame: 1});
    const {getCreatedIds, runFrame, cancelAnimationFrame} = await setup(layer, [fourTilesViewport]);
    const createdIds = getCreatedIds();

    expect(
      createdIds.filter(id => id.endsWith('-12')).length,
      'every visible tile is created'
    ).toBe(4);
    expect(
      createdIds.length,
      'one hidden tile is created although visible tiles fill the limit'
    ).toBe(5);
    runFrame();
    expect(getCreatedIds().length, 'one more tile next frame').toBe(6);
    const {nextTilesFrame} = layer.state;
    expect(nextTilesFrame, 'requests the next batch').toBeDefined();
    layer.finalizeState();
    expect(cancelAnimationFrame, 'finalizing cancels the frame request').toHaveBeenCalledWith(
      nextTilesFrame
    );
  });
}
