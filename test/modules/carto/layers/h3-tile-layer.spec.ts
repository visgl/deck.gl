// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getResolution, cellToChildren} from 'h3-js';
import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {H3TileLayer} from '@deck.gl/carto';
import {WebMercatorViewport} from '@deck.gl/core';
import {testPickingLayer} from '../../layers/test-picking-layer';

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  maxresolution: 10,
  tiles: TILES
};

test('H3TileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: H3TileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: H3TileLayer, testCases, onError: t.notOk});
  t.end();
});

test('H3TileLayer tilejson', async t => {
  const testCases = [
    {
      Layer: H3TileLayer,
      props: {
        data: TILEJSON,
        getTileData: () => []
      },
      assert: t.ok,
      onAfterUpdate({layer, subLayers}) {
        if (!layer.isLoaded) {
          t.equal(subLayers.length, 1, 'Rendered sublayers');
          t.deepEqual(subLayers[0].props.data, TILES, 'Extract tiles from tilejson');
          t.deepEqual(subLayers[0].props.maxZoom, 10, 'Extract maxZoom from tilejson');
        }
      }
    }
  ];
  await testLayerAsync({Layer: H3TileLayer, testCases, onError: t.notOk});
  t.end();
});

test('H3TileLayer autoHighlight', async t => {
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
          t.comment('hover over h3');
          t.ok(info.object, 'info.object is populated');
          t.equal(info.object.id, '81753ffffffffff', 'h3 is correct');
          t.equal(info.object.value, 3, 'object value is correct');
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: '',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('pointer leave');
          t.notOk(info.object, 'info.object is not populated');
        }
      }
    ]
  });

  t.end();
});
