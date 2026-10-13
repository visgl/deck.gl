// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {expect, test} from 'vitest';
import {
  _SharedMVTLayer as SharedMVTLayer,
  _SharedTileset2D as SharedTileset2D
} from '@deck.gl/geo-layers';

/** A real deck.gl view switch must redraw geographic content without decoding it again. */
test('shared MVT consumers draw in map, globe and map again', async () => {
  const parent = document.createElement('div');
  document.body.append(parent);
  let deck: Deck<any> | undefined;
  let requests = 0;
  const fetch = async (_url: string, options: any) => {
    requests++;
    expect(options.loadOptions.mvt.coordinates).toBe('local');
    return [
      {
        type: 'Feature',
        properties: {layerName: 'water'},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0.45, 0.45],
              [0.55, 0.45],
              [0.55, 0.55],
              [0.45, 0.55],
              [0.45, 0.45]
            ]
          ]
        }
      }
    ];
  };
  const loader = new SharedMVTLayer({data: 'https://example.com/{z}/{x}/{y}.pbf', fetch});
  const tileset = new SharedTileset2D({...loader._getTilesetOptions(), maxZoom: 0});
  const getLayers = () => [
    new SharedMVTLayer({
      id: 'fills',
      data: tileset,
      filled: true,
      stroked: false,
      getFillColor: [255, 0, 0],
      parameters: {cullMode: 'none'}
    }),
    new SharedMVTLayer({
      id: 'outlines',
      data: tileset,
      filled: false,
      stroked: true,
      getLineColor: [255, 0, 0],
      getLineWidth: 2,
      lineWidthUnits: 'pixels',
      parameters: {cullMode: 'none'}
    })
  ];
  let complete: (() => void) | undefined;
  let latest = '';
  let modeName = 'map';
  const waitFrame = () =>
    new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`No loaded red frame in ${modeName}: ${latest}`)),
        30000
      );
      complete = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  try {
    const ready = waitFrame();
    deck = new Deck({
      parent,
      width: 128,
      height: 128,
      useDevicePixels: false,
      deviceProps: {adapters: [webgl2Adapter]},
      views: new MapView({id: 'view'}),
      initialViewState: {longitude: 0, latitude: 0, zoom: 0},
      layers: getLayers(),
      onError: error => {
        throw error;
      },
      onAfterRender: () => {
        if (
          !complete ||
          !(deck as any)?.layerManager.getLayers().every((layer: any) => layer.isLoaded)
        )
          return;
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d')!;
        context.drawImage(deck!.getCanvas()!, 0, 0);
        const pixels = context.getImageData(0, 0, 128, 128).data;
        let red = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (pixels[i] > 200 && pixels[i + 1] < 60 && pixels[i + 2] < 60) red++;
        latest += ` red=${red} requests=${requests}`;
        if (red > 20) {
          const done = complete;
          complete = undefined;
          done();
        }
      }
    });
    await ready;
    for (const mode of ['globe', 'map'] as const) {
      modeName = mode;
      const loaded = waitFrame();
      deck.setProps({
        views: mode === 'globe' ? new GlobeView({id: 'view'}) : new MapView({id: 'view'}),
        layers: getLayers()
      });
      await loaded;
    }
    expect(requests).toBe(1);
  } finally {
    deck?.finalize();
    tileset.finalize();
    parent.remove();
  }
  // Software WebGL shader compilation can exceed the unit-test timeout.
}, 90000);
