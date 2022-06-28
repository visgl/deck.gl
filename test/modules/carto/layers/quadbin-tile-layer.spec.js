import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_QuadbinTileLayer as QuadbinTileLayer} from '@deck.gl/carto';
import {WebMercatorViewport} from '@deck.gl/core';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {tileToQuadbin, tileToQuadkey, quadbinToTile} from '@deck.gl/carto/layers/quadbin-utils';

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  maxresolution: 10,
  tiles: TILES
};

test('QuadbinTileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: QuadbinTileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: QuadbinTileLayer, testCases, onError: t.notOk});
  t.end();
});

test('QuadbinTileLayer tilejson', async t => {
  const testCases = [
    {
      Layer: QuadbinTileLayer,
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
  await testLayerAsync({Layer: QuadbinTileLayer, testCases, onError: t.notOk});
  t.end();
});

function quadkeyToTile(quadkey) {
  const tile = {x: 0, y: 0, z: quadkey.length};

  for (let i = tile.z; i > 0; i--) {
    const mask = 1 << (i - 1);
    const q = Number(quadkey[tile.z - i]);
    if (q === 1) tile.x |= mask;
    if (q === 2) tile.y |= mask;
    if (q === 3) {
      tile.x |= mask;
      tile.y |= mask;
    }
  }
  return tile;
}

test('QuadbinTileLayer autoHighlight', async t => {
  await testPickingLayer({
    layer: new QuadbinTileLayer({
      id: 'quadbin-tile',
      data: TILEJSON,
      getTileData(e) {
        // Generate 4 quadbins to fill the tile
        return [0, 1, 2, 3].map(i => {
          let tile = quadbinToTile(e.index.i);
          const quadkey = tileToQuadkey(tile);
          const child = `${quadkey}${i}`;
          tile = quadkeyToTile(child);
          return {id: tileToQuadbin(tile), value: i};
        });
      },
      autoHighlight: true,
      pickable: true
    }),
    viewport: new WebMercatorViewport({latitude: 0, longitude: 0, zoom: 1}),
    testCases: [
      {
        pickedColor: new Uint8Array([4, 0, 0, 0]),
        pickedLayerId: 'quadbin-tile-layer-quadbin-tile-481bffffffffffff-cell-fill',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('hover over quadbin');
          t.ok(info.object, 'info.object is populated');
          t.equal(info.object.id, '482bffffffffffff', 'quadbin is correct');
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
