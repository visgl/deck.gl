// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {RasterTileLayer} from '@deck.gl/carto';
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

test('RasterTileLayer', async () => {
  const testCases = generateLayerTests({
    Layer: RasterTileLayer,
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: RasterTileLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('RasterTileLayer tilejson', async () => {
  const testCases = [
    {
      Layer: RasterTileLayer,
      props: {
        data: TILEJSON,
        tile: {index: {q: TILE_INDEX}},
        getTileData: () => BINARY_RASTER_TILE
      },
      assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
      onAfterUpdate({layer, subLayers}) {
        expect(subLayers.length, 'Rendered sublayers').toBe(1);

        const [spatialIndexTileLayer] = subLayers;
        expect(spatialIndexTileLayer.props.data, 'Extract tiles from tilejson').toEqual(TILES);
        expect(spatialIndexTileLayer.props.minZoom, 'Extract minZoom from tilejson').toBe(6);
        expect(spatialIndexTileLayer.props.maxZoom, 'Extract maxZoom from tilejson').toBe(6);

        const rasterLayer = spatialIndexTileLayer.renderSubLayers(spatialIndexTileLayer.props);
        expect(rasterLayer, 'Rendered raster layer').toBeTruthy();
        expect(rasterLayer.props.tileIndex, 'Pass tileIndex to raster layer').toBe(TILE_INDEX);
      }
    }
  ];
  await testLayerAsync({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: RasterTileLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test.skip('RasterLayer', async () => {
  const testCases = [
    {
      Layer: RasterLayer,
      props: {
        data: {
          blockSize: 256,
          cells: {
            properties: [],
            numericProps: {band: {value: new Float32Array(256 * 256).fill(7)}}
          }
        },
        tileIndex: TILE_INDEX
      },
      assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
      onAfterUpdate({layer, subLayers}) {
        expect(subLayers.length, 'Rendered sublayers').toBe(1);
        const [rasterColumnLayer] = subLayers;
        expect(
          rasterColumnLayer.props.offset,
          'Correct offset passed to raster column layer'
        ).toEqual([250.5, 319, 0.001953125]);

        const feature = layer.getSubLayerAccessor(d => d)(undefined, {
          data: rasterColumnLayer.props.data,
          index: 0
        });
        expect(feature.properties.band, 'Band property correctly passed through').toBe(7);
      }
    }
  ];
  await testLayerAsync({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: RasterLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});
