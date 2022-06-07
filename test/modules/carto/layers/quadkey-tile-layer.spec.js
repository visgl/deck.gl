import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_QuadkeyTileLayer as QuadkeyTileLayer} from '@deck.gl/carto';
import {WebMercatorViewport} from '@deck.gl/core';
import {testPickingLayer} from '../../layers/test-picking-layer';

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  maxresolution: 10,
  tiles: TILES
};

test('QuadkeyTileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: QuadkeyTileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: QuadkeyTileLayer, testCases, onError: t.notOk});
  t.end();
});

test('QuadkeyTileLayer tilejson', async t => {
  const testCases = [
    {
      Layer: QuadkeyTileLayer,
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
  await testLayerAsync({Layer: QuadkeyTileLayer, testCases, onError: t.notOk});
  t.end();
});

test('QuadkeyTileLayer autoHighlight', async t => {
  await testPickingLayer({
    layer: new QuadkeyTileLayer({
      id: 'quadkey-tile',
      data: TILEJSON,
      getTileData(e) {
        // Generate 4 quadkeys to fill the tile
        return [0, 1, 2, 3].map(i => ({id: `${e.index.i}${i}`, value: i}));
      },
      autoHighlight: true,
      pickable: true
    }),
    viewport: new WebMercatorViewport({latitude: 0, longitude: 0, zoom: 1}),
    testCases: [
      {
        pickedColor: new Uint8Array([4, 0, 0, 0]),
        pickedLayerId: 'quadkey-tile-layer-quadkey-tile-2-cell-fill',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('hover over quadkey');
          t.ok(info.object, 'info.object is populated');
          t.equal(info.object.id, '23', 'quadkey is correct');
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
