import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_RasterTileLayer as RasterTileLayer} from '@deck.gl/carto';
import RasterLayer from '@deck.gl/carto/layers/raster-layer';
import binaryRasterTileData from '../data/binaryRasterTile.json'; // tile 487624ffffffffff

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  minzoom: 6,
  maxzoom: 6,
  tiles: TILES
};
const TILE_INDEX = 5234261499580514303n;

const BINARY_RASTER_TILE = new Uint8Array(binaryRasterTileData).buffer;

test('RasterTileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: RasterTileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: RasterTileLayer, testCases, onError: t.notOk});
  t.end();
});

test('RasterTileLayer tilejson', async t => {
  const testCases = [
    {
      Layer: RasterTileLayer,
      props: {
        data: TILEJSON,
        tile: {index: {q: TILE_INDEX}},
        getTileData: () => BINARY_RASTER_TILE
      },
      assert: t.ok,
      onAfterUpdate({layer, subLayers}) {
        t.equal(subLayers.length, 1, 'Rendered sublayers');

        const [spatialIndexTileLayer] = subLayers;
        t.deepEqual(spatialIndexTileLayer.props.data, TILES, 'Extract tiles from tilejson');
        t.equal(spatialIndexTileLayer.props.minZoom, 6, 'Extract minZoom from tilejson');
        t.equal(spatialIndexTileLayer.props.maxZoom, 6, 'Extract maxZoom from tilejson');

        const rasterLayer = spatialIndexTileLayer.renderSubLayers(spatialIndexTileLayer.props);
        t.ok(rasterLayer, 'Rendered raster layer');
        t.equal(rasterLayer.props.tileIndex, TILE_INDEX, 'Pass tileIndex to raster layer');
      }
    }
  ];
  await testLayerAsync({Layer: RasterTileLayer, testCases, onError: t.notOk});
  t.end();
});

test('RasterLayer', async t => {
  const testCases = [
    {
      Layer: RasterLayer,
      props: {
        data: {
          blockWidth: 256,
          blockHeight: 256,
          cells: {
            properties: [],
            numericProps: {band: {value: new Float32Array(256 * 256).fill(7)}}
          }
        },
        tileIndex: TILE_INDEX
      },
      assert: t.ok,
      onAfterUpdate({layer, subLayers}) {
        t.equal(subLayers.length, 1, 'Rendered sublayers');
        const [rasterColumnLayer] = subLayers;
        t.deepEqual(
          rasterColumnLayer.props.offset,
          [250.5, 319, 0.001953125],
          'Correct offset passed to raster column layer'
        );

        const feature = layer.getSubLayerAccessor(d => d)(undefined, {
          data: rasterColumnLayer.props.data,
          index: 0
        });
        t.equal(feature.properties.band, 7, 'Band property correctly passed through');
      }
    }
  ];
  await testLayerAsync({Layer: RasterLayer, testCases, onError: t.notOk});
  t.end();
});
