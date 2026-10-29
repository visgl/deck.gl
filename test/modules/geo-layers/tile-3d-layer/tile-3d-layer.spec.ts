// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerTestCase, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {normalizeCoordinateSystem} from '@deck.gl/geo-layers/tile-3d-layer/tile-3d-layer';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {TILE_TYPE} from '@loaders.gl/tiles';

test('Tile3DLayer#normalizeCoordinateSystem', () => {
  // Loaders that predate the v9.3 string constants report numeric values, see issue #10368
  expect(normalizeCoordinateSystem(-1)).toBe('default');
  expect(normalizeCoordinateSystem(0)).toBe('cartesian');
  expect(normalizeCoordinateSystem(1)).toBe('lnglat');
  expect(normalizeCoordinateSystem(2)).toBe('meter-offsets');
  expect(normalizeCoordinateSystem(3)).toBe('lnglat-offsets');

  // String constants pass through untouched
  expect(normalizeCoordinateSystem('meter-offsets')).toBe('meter-offsets');
  expect(normalizeCoordinateSystem('lnglat')).toBe('lnglat');

  // Unknown numeric values are passed through so that the core validation reports them
  expect(normalizeCoordinateSystem(42)).toBe(42);
});

test('Tile3DLayer#mesh sub layer normalizes legacy numeric coordinateSystem', () => {
  const layer = new Tile3DLayer({id: 'tile-3d-legacy-mesh'});
  const tileHeader = {
    id: 'legacy-mesh-tile',
    type: TILE_TYPE.MESH,
    content: {
      attributes: {positions: {value: new Float32Array([0, 0, 0]), size: 3}},
      indices: {value: new Uint16Array([0]), size: 1},
      cartographicOrigin: [0, 0, 0],
      // `@loaders.gl/i3s` reports the pre-v9.3 numeric enum, see issue #10368
      coordinateSystem: 2
    }
  };

  // @ts-expect-error Calling the private sub layer factory for test-only validation.
  const meshLayer = layer._makeSimpleMeshLayer(tileHeader);

  expect(meshLayer.props.coordinateSystem, 'Normalizes to a string constant').toBe('meter-offsets');
});

test('Tile3DLayer', async () => {
  const testCases: LayerTestCase<Tile3DLayer>[] = [
    {
      title: 'Tile3DLayer initial load',
      props: {
        data: './test/data/3d-tiles/tileset.json',
        getPointColor: [0, 0, 0]
      },
      onBeforeUpdate: () => console.log('inital load'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers[0], 'Renders sub layers').toBeTruthy();
        }
      }
    },
    {
      title: 'Tile3DLayer update opacity',
      updateProps: {
        opacity: 0.5
      },
      onBeforeUpdate: () => console.log('update opacity'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers[0].props.opacity, 'Updated sub layer props').toBe(0.5);
        }
      }
    }
  ];

  await testLayerAsync({
    Layer: Tile3DLayer,
    viewport: new WebMercatorViewport({
      width: 400,
      height: 300,
      longitude: -75.61209423,
      latitude: 40.042530625,
      zoom: 12
    }),
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('Tile3DLayer loads and draws b3dm content on WebGPU', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const errors: Error[] = [];
  let deck: Deck | null = null;

  try {
    const scenegraphLayer = await new Promise<ScenegraphLayer>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timed out loading Tile3DLayer b3dm content')),
        30000
      );

      deck = new Deck({
        id: 'tile-3d-webgpu-deck',
        device: webgpuDevice,
        width: 400,
        height: 300,
        initialViewState: {
          longitude: -75.61209423,
          latitude: 40.042530625,
          zoom: 12
        },
        controller: false,
        layers: [
          new Tile3DLayer({
            id: 'tile-3d-webgpu',
            data: '/test/data/3d-tiles/tileset.json'
          })
        ],
        onError: error => {
          errors.push(error);
          clearTimeout(timeout);
          reject(error);
        },
        onAfterRender: () => {
          // @ts-expect-error Accessing the layer manager for test-only validation.
          const layers = deck?.layerManager?.getLayers() || [];
          const tileLayer = layers.find(layer => layer instanceof Tile3DLayer);
          const renderedScenegraphLayer = layers.find(layer => layer instanceof ScenegraphLayer) as
            | ScenegraphLayer
            | undefined;
          const tile = (renderedScenegraphLayer?.props as unknown as {tile?: {tileDrawn?: boolean}})
            ?.tile;

          if (
            tileLayer?.isLoaded &&
            tile?.tileDrawn &&
            renderedScenegraphLayer?.state.models.length
          ) {
            clearTimeout(timeout);
            resolve(renderedScenegraphLayer);
          }
        }
      });
    });

    expect(scenegraphLayer.state.models.length, 'creates glTF models').toBeGreaterThan(0);
    await webgpuDevice.handle.queue.onSubmittedWorkDone();
    expect(errors).toEqual([]);
  } finally {
    deck?.finalize();
  }
}, 40000);
