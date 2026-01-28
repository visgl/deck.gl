// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {QuadbinTileLayer} from '@deck.gl/carto';
import {renderSubLayers} from '@deck.gl/carto/layers/quadbin-tile-layer';
import {WebMercatorViewport} from '@deck.gl/core';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {bigIntToHex, cellToTile, hexToBigInt, tileToCell} from 'quadbin';

const TILES = ['https://tile-url.com/{i}'];
const TILEJSON = {
  maxresolution: 10,
  tiles: TILES
};

export function tileToQuadkey(tile) {
  let index = '';
  for (let z = tile.z; z > 0; z--) {
    let b = 0;
    const mask = 1 << (z - 1);
    if ((tile.x & mask) !== 0) b++;
    if ((tile.y & mask) !== 0) b += 2;
    index += b.toString();
  }
  return index;
}

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

test('QuadbinTileLayer', async () => {
  const testCases = generateLayerTests({
    Layer: QuadbinTileLayer,
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({
    Layer: QuadbinTileLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('QuadbinTileLayer tilejson', async () => {
  const testCases = [
    {
      Layer: QuadbinTileLayer,
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
  await testLayerAsync({
    Layer: QuadbinTileLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

// JSON data format has ids in BigInt natively, while JSON uses hex
[true, false].map(isBigInt => {
  test(`QuadbinTileLayer autoHighlight BigInt:${isBigInt}`, async () => {
    await testPickingLayer({
      layer: new QuadbinTileLayer({
        id: 'quadbin-tile',
        data: TILEJSON,
        getTileData(e) {
          // Generate 4 quadbins to fill the tile
          return [0, 1, 2, 3].map(i => {
            let tile = cellToTile(hexToBigInt(e.index.i));
            const quadkey = tileToQuadkey(tile);
            const child = `${quadkey}${i}`;
            tile = quadkeyToTile(child);
            let id = tileToCell(tile);
            if (!isBigInt) {
              id = bigIntToHex(id);
            }
            return {id, value: i};
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
            console.log('hover over quadbin');
            expect(info.object, 'info.object is populated').toBeTruthy();
            expect(info.object.id, 'quadbin is correct').toBe(
              isBigInt ? 5200531669706080255n : '482bffffffffffff'
            );
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
});

test('QuadbinTileLayer.renderSubLayers', async () => {
  let layer = renderSubLayers({});
  expect(layer, 'No sublayers with null data').toBe(null);

  let data = [{id: 5200531669706080255n}];
  layer = renderSubLayers({data});
  expect(layer, 'Sublayer rendered with BigInt data').toBeTruthy();
  expect(layer.props.getQuadbin(data[0]), 'BigInt value returned in accessor').toBe(
    5200531669706080255n
  );

  data = [{id: '482bffffffffffff'}];
  layer = renderSubLayers({data});
  expect(layer, 'Sublayer rendered with hexidecimal data').toBeTruthy();
  expect(layer.props.getQuadbin(data[0]), 'converted BigInt value returned in accessor').toBe(
    5200531669706080255n
  );
});
