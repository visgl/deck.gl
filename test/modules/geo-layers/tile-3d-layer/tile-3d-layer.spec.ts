// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerTestCase, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';

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
