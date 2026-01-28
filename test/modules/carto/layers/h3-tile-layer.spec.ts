// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getResolution, cellToChildren} from 'h3-js';
import {test, expect, describe} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {H3TileLayer} from '@deck.gl/carto';
import {WebMercatorViewport} from '@deck.gl/core';
import {testPickingLayer} from '../../layers/test-picking-layer';

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  maxresolution: 10,
  tiles: TILES
};

test('H3TileLayer', async () => {
  const testCases = generateLayerTests({
    Layer: H3TileLayer,
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({Layer: H3TileLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('H3TileLayer tilejson', async () => {
  const testCases = [
    {
      Layer: H3TileLayer,
      props: {
        data: TILEJSON,
        getTileData: () => []
      },
      assert: (cond, msg) => expect(cond).toBeTruthy(),
      onAfterUpdate({layer, subLayers}) {
        if (!layer.isLoaded) {
          expect(subLayers.length, 'Rendered sublayers').toBe(1);
          expect(subLayers[0].props.data, 'Extract tiles from tilejson').toEqual(TILES);
          expect(subLayers[0].props.maxZoom, 'Extract maxZoom from tilejson').toEqual(10);
        }
      }
    }
  ];
  await testLayerAsync({Layer: H3TileLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('H3TileLayer autoHighlight', async () => {
  await testPickingLayer({
    layer: new H3TileLayer({
      id: 'h3-tile',
      data: TILEJSON,
      getTileData(e) {
        // Generate 7 H3 indices to fill the tile
        const resolution = getResolution(e.index.i) + 1;
        const out = cellToChildren(e.index.i, resolution).map((id, n) => ({id, value: n}));
        return out;
      },
      autoHighlight: true,
      pickable: true
    }),
    viewport: new WebMercatorViewport({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      width: 100,
      height: 100
    }),
    testCases: [
      {
        pickedColor: new Uint8Array([4, 0, 0, 0]),
        pickedLayerId: 'h3-tile-layer-h3-tile-8075fffffffffff-hexagon-cell-hifi-fill',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          console.log('hover over h3');
          expect(info.object, 'info.object is populated').toBeTruthy();
          expect(info.object.id, 'h3 is correct').toBe('81753ffffffffff');
          expect(info.object.value, 'object value is correct').toBe(3);
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: '',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          console.log('pointer leave');
          expect(info.object, 'info.object is not populated').toBeFalsy();
        }
      }
    ]
  });
});
