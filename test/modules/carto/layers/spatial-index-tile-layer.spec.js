import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import SpatialIndexTileLayer from '@deck.gl/carto/layers/spatial-index-tile-layer';

const TILES = ['https://tile-url.com/{i}'];

test('SpatialIndexTileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: SpatialIndexTileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: SpatialIndexTileLayer, testCases, onError: t.notOk});
  t.end();
});
