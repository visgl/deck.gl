// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {testLayerAsync} from '@deck.gl/test-utils';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';

test('Tile3DLayer', async t => {
  const testCases = [
    {
      props: {
        data: './test/data/3d-tiles/tileset.json',
        getPointColor: [0, 0, 0]
      },
      onBeforeUpdate: () => t.comment('inital load'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.ok(subLayers[0], 'Renders sub layers');
        }
      }
    },
    {
      updateProps: {
        opacity: 0.5
      },
      onBeforeUpdate: () => t.comment('update opacity'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers[0].props.opacity, 0.5, 'Updated sub layer props');
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
    onError: t.notOk
  });

  t.end();
});
