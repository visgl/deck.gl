// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {
  COORDINATE_SYSTEM,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {
  _SharedMVTLayer as SharedMVTLayer,
  _SharedTileset2D as SharedTileset2D,
  sharedTile2DDeckAdapter
} from '@deck.gl/geo-layers';
import {SharedTile2DView} from '../../../modules/geo-layers/src/shared-tile-2d-layer/shared-tile-2d-view';
import {getMVTDataInWGS84} from '../../../modules/geo-layers/src/shared-mvt-layer/shared-mvt-layer';

const DATA = [
  {
    type: 'Feature',
    id: 7,
    properties: {layerName: 'place'},
    geometry: {type: 'Point', coordinates: [0.5, 0.5]}
  }
];
const viewport = new WebMercatorViewport({
  width: 128,
  height: 128,
  longitude: 0,
  latitude: 0,
  zoom: 0
});
async function waitLoaded(view: SharedTile2DView) {
  await vi.waitFor(() => expect(view.isLoaded).toBe(true));
}

describe('SharedMVTLayer', () => {
  it('retains decoded tiles for a staggered consumer and detaches independently', async () => {
    const fetch = vi.fn(async () => DATA);
    const loader = new SharedMVTLayer({data: 'https://example.com/{z}/{x}/{y}.mvt', fetch});
    expect(loader._getTilesetOptions().adapter).toBe(sharedTile2DDeckAdapter);
    const tileset = new SharedTileset2D({...loader._getTilesetOptions(), maxZoom: 0});
    const first = new SharedTile2DView(tileset);
    const second = new SharedTile2DView(tileset);
    try {
      first.update(viewport);
      await waitLoaded(first);
      second.update(viewport);
      await waitLoaded(second);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(first.selectedTiles![0].content).toBe(second.selectedTiles![0].content);
      expect(fetch.mock.calls[0][1].loadOptions.mvt).toMatchObject({
        coordinates: 'local',
        shape: 'geojson-table',
        tileIndex: {x: 0, y: 0, z: 0}
      });
      first.finalize();
      second.update(viewport);
      expect(second.selectedTiles![0].content).toBe(DATA);
    } finally {
      first.finalize();
      second.finalize();
      tileset.finalize();
    }
  });

  it('uses the same cache when switching map to globe and back', async () => {
    const fetch = vi.fn(async () => DATA);
    const loader = new SharedMVTLayer({data: 'https://example.com/{z}/{x}/{y}.mvt', fetch});
    const tileset = new SharedTileset2D({...loader._getTilesetOptions(), maxZoom: 0});
    const view = new SharedTile2DView(tileset);
    const consumer = new SharedMVTLayer({
      data: tileset,
      renderSubLayers: props => {
        captured = props;
        return null;
      }
    });
    let captured: any;
    try {
      view.update(viewport);
      await waitLoaded(view);
      const tile = view.selectedTiles![0];
      const globe = new GlobeViewport({
        width: 128,
        height: 128,
        longitude: 0,
        latitude: 0,
        zoom: 0
      });
      for (const active of [viewport, globe, viewport]) {
        view.update(active);
        await waitLoaded(view);
        consumer.context = {viewport: active} as any;
        consumer.renderSubLayers({
          ...consumer.props,
          id: 'tile',
          data: tile.content,
          tile,
          _offset: 0
        } as any);
        if (active === globe) {
          expect(captured.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
          expect(captured.data[0].geometry.coordinates).toEqual([0, 0]);
        } else {
          expect(captured.coordinateSystem).toBe(COORDINATE_SYSTEM.CARTESIAN);
          expect(captured.data).toBe(DATA);
          expect(captured.modelMatrix.transformAsPoint([0.5, 0.5, 0])).toEqual([256, -256, 0]);
        }
      }
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(DATA[0].geometry.coordinates).toEqual([0.5, 0.5]);
      expect(getMVTDataInWGS84(DATA, tile.index)).toBe(getMVTDataInWGS84(DATA, tile.index));
    } finally {
      view.finalize();
      tileset.finalize();
    }
  });
});

it('keeps an in-flight load alive when one consumer detaches', async () => {
  let finish: (data: any) => void = () => {};
  let signal: AbortSignal | undefined;
  const fetch = vi.fn((_url: string, options: any) => {
    signal = options.signal;
    return new Promise<any>(resolve => {
      finish = resolve;
    });
  });
  const loader = new SharedMVTLayer({data: 'https://example.com/{z}/{x}/{y}.mvt', fetch});
  const tileset = new SharedTileset2D({...loader._getTilesetOptions(), maxZoom: 0});
  const a = new SharedTile2DView(tileset);
  const b = new SharedTile2DView(tileset);
  try {
    a.update(viewport);
    b.update(viewport);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    a.finalize();
    expect(signal?.aborted).toBe(false);
    finish(DATA);
    await waitLoaded(b);
    expect(b.selectedTiles![0].content).toBe(DATA);
  } finally {
    a.finalize();
    b.finalize();
    tileset.finalize();
  }
});

it('converts picked geometry and highlights IDs without modifying shared data', () => {
  const layer = new SharedMVTLayer({data: null, uniqueIdProperty: 'key', highlightedFeatureId: 9});
  const feature = {...DATA[0], properties: {...DATA[0].properties, key: 9}};
  const tile: any = {index: {x: 0, y: 0, z: 0}, content: [feature]};
  layer.context = {viewport} as any;
  layer.initializeState();
  const props = layer.getSubLayerPropsByTile(tile);
  expect(props.highlightedObjectIndex).toBe(0);
  expect(props.clipBounds).toEqual([0, 0, 1, 1]);
  const picked = layer.getPickingInfo({
    info: {picked: true, object: feature, index: 0},
    sourceLayer: {props: {tile}}
  } as any);
  expect(picked.object.geometry.coordinates).toEqual([0, 0]);
  expect(feature.geometry.coordinates).toEqual([0.5, 0.5]);
});

it('decodes an MVT before the cache owner has a deck.gl context', async () => {
  const {MVTLoader} = await import('@loaders.gl/mvt');
  // A valid protobuf tile containing an empty layer named "test", version 2.
  const bytes = Uint8Array.from([0x1a, 8, 0x0a, 4, 116, 101, 115, 116, 0x78, 2]);
  const url = `data:application/x-protobuf;base64,${Buffer.from(bytes).toString('base64')}`;
  const layer = new SharedMVTLayer({data: url, loaders: [MVTLoader], loadOptions: {worker: false}});
  const tile: any = {id: '0-0-0', index: {x: 0, y: 0, z: 0}};
  expect(await layer.getTileData(tile)).toEqual([]);
});

it('skips failed tiles on a globe and maps highlights to filtered sublayer data', async () => {
  const {GeoJsonLayer} = await import('@deck.gl/layers');
  const layer = new SharedMVTLayer({data: null, highlightedFeatureId: 9});
  layer.context = {viewport: new GlobeViewport({width: 128, height: 128, zoom: 0})} as any;
  layer.initializeState();
  const feature = {...DATA[0], id: 9};
  const tile: any = {index: {x: 0, y: 0, z: 0}, content: [DATA[0], feature]};
  expect(layer.renderSubLayers({data: null, tile} as any)).toBeNull();
  const sublayer = new GeoJsonLayer({data: [feature]});
  expect(layer.getSubLayerPropsByTile(tile, sublayer).highlightedObjectIndex).toBe(0);
  expect(
    layer.getSubLayerPropsByTile(tile, new GeoJsonLayer({data: [DATA[0]]})).highlightedObjectIndex
  ).toBe(-1);
});
