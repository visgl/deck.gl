// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerTestCase, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

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
