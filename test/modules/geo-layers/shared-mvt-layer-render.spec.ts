// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {expect, test} from 'vitest';
import {MVT2DLayer, Tileset2D} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {lngLatToWorld} from '@math.gl/web-mercator';

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
  const loader = new MVT2DLayer({data: 'https://example.com/{z}/{x}/{y}.pbf', fetch});
  const tileset = new Tileset2D({...loader._getTilesetOptions(), maxZoom: 0});
  const getLayers = () => [
    new MVT2DLayer({
      id: 'fills',
      pickable: true,
      data: tileset,
      filled: true,
      stroked: false,
      getFillColor: [255, 0, 0],
      parameters: {cullMode: 'none'}
    }),
    new MVT2DLayer({
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
      deviceProps: {adapters: [webgl2Adapter], _reuseDevices: false},
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
    const checkPicking = () => {
      const info = deck!.pickObject({x: 64, y: 64});
      expect(info?.object).toBeTruthy();
      const ring = info!.object.geometry.coordinates[0];
      expect(ring[0][0]).toBeCloseTo(-18, 5);
      expect(
        ring.every(
          ([longitude, latitude]) => Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90
        )
      ).toBe(true);
    };
    checkPicking();
    for (const mode of ['globe', 'map'] as const) {
      modeName = mode;
      const loaded = waitFrame();
      deck.setProps({
        views: mode === 'globe' ? new GlobeView({id: 'view'}) : new MapView({id: 'view'}),
        layers: getLayers()
      });
      await loaded;
      checkPicking();
    }
    expect(requests).toBe(1);
  } finally {
    const device = deck?.device;
    deck?.finalize();
    device?.destroy();
    // Deck.finalize removes its canvas but does not release the browser context.
    // Leave room for other tests in the shared headless browser.
    (device?.handle as WebGL2RenderingContext | undefined)
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
    tileset.finalize();
    parent.remove();
  }
  // Software WebGL shader compilation can exceed the unit-test timeout.
}, 90000);

/** Guards the off-center latitude error without double-applying viewport height scaling. */
test('low-zoom MVT extrusions match geographic geometry at off-center latitudes', async () => {
  const parent = document.createElement('div');
  document.body.append(parent);
  const ring = [
    [-0.5, 59.75],
    [0.5, 59.75],
    [0.5, 60.25],
    [-0.5, 60.25],
    [-0.5, 59.75]
  ];
  const geographic = [
    {type: 'Feature', properties: {}, geometry: {type: 'Polygon', coordinates: [ring]}}
  ];
  const local = [
    {
      ...geographic[0],
      geometry: {
        type: 'Polygon',
        coordinates: [
          ring.map(position => {
            const [x, y] = lngLatToWorld(position);
            return [x / 512, 1 - y / 512];
          })
        ]
      }
    }
  ];
  const tileset = new Tileset2D({maxZoom: 0, getTileData: async () => local});
  const style = {
    extruded: true,
    getElevation: 100000,
    getFillColor: [255, 0, 0],
    stroked: false,
    material: false,
    parameters: {cullMode: 'none' as const}
  };
  let deck: Deck<any> | undefined;
  let capture: ((extent: number[]) => void) | undefined;
  const frame = () =>
    new Promise<number[]>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('No loaded extrusion frame')), 20000);
      capture = extent => {
        clearTimeout(timer);
        capture = undefined;
        resolve(extent);
      };
    });
  try {
    const first = frame();
    deck = new Deck({
      parent,
      width: 512,
      height: 512,
      useDevicePixels: false,
      deviceProps: {adapters: [webgl2Adapter], _reuseDevices: false},
      views: new MapView({id: 'map'}),
      initialViewState: {longitude: 0, latitude: 60, zoom: 3, pitch: 60},
      layers: [new GeoJsonLayer({id: 'reference', data: geographic, ...style})],
      onAfterRender: () => {
        if (
          !capture ||
          !(deck as any)?.layerManager.getLayers().every((layer: any) => layer.isLoaded)
        )
          return;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const context = canvas.getContext('2d')!;
        context.drawImage(deck!.getCanvas()!, 0, 0);
        const pixels = context.getImageData(0, 0, 512, 512).data;
        let minY = 512;
        let maxY = -1;
        for (let y = 0; y < 512; y++)
          for (let x = 0; x < 512; x++) {
            const i = (y * 512 + x) * 4;
            if (pixels[i] > 200 && pixels[i + 1] < 60 && pixels[i + 2] < 60) {
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }
          }
        if (maxY - minY > 5) capture([minY, maxY]);
      }
    });
    await first;
    for (const latitude of [60, 54, 45]) {
      const referenceFrame = frame();
      deck.setProps({
        viewState: {longitude: 0, latitude, zoom: 3, pitch: 60},
        layers: [new GeoJsonLayer({id: 'reference', data: geographic, ...style})]
      });
      const reference = await referenceFrame;
      const tileFrame = frame();
      deck.setProps({layers: [new MVT2DLayer({id: 'tiled', data: tileset, ...style})]});
      const tiled = await tileFrame;
      expect(Math.abs(tiled[0] - reference[0])).toBeLessThanOrEqual(1);
      expect(Math.abs(tiled[1] - reference[1])).toBeLessThanOrEqual(1);
    }
  } finally {
    const device = deck?.device;
    deck?.finalize();
    device?.destroy();
    (device?.handle as WebGL2RenderingContext | undefined)
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
    tileset.finalize();
    parent.remove();
  }
}, 120000);
