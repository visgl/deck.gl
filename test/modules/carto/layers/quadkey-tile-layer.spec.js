import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_QuadkeyTileLayer as QuadkeyTileLayer} from '@deck.gl/carto';

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
