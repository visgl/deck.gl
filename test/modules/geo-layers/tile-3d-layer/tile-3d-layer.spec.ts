// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerTestCase, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {normalizeCoordinateSystem} from '@deck.gl/geo-layers/tile-3d-layer/tile-3d-layer';
import {COORDINATE_SYSTEM, WebMercatorViewport} from '@deck.gl/core';

test('Tile3DLayer#normalizeCoordinateSystem', () => {
  // Loaders that predate the v9.3 string constants report numeric values, see issue #10368
  expect(normalizeCoordinateSystem(-1)).toBe(COORDINATE_SYSTEM.DEFAULT);
  expect(normalizeCoordinateSystem(0)).toBe(COORDINATE_SYSTEM.CARTESIAN);
  expect(normalizeCoordinateSystem(1)).toBe(COORDINATE_SYSTEM.LNGLAT);
  expect(normalizeCoordinateSystem(2)).toBe(COORDINATE_SYSTEM.METER_OFFSETS);
  expect(normalizeCoordinateSystem(3)).toBe(COORDINATE_SYSTEM.LNGLAT_OFFSETS);

  // String constants pass through untouched
  expect(normalizeCoordinateSystem(COORDINATE_SYSTEM.METER_OFFSETS)).toBe(
    COORDINATE_SYSTEM.METER_OFFSETS
  );
  expect(normalizeCoordinateSystem(COORDINATE_SYSTEM.LNGLAT)).toBe(COORDINATE_SYSTEM.LNGLAT);

  // Unknown numeric values are passed through so that the core validation reports them
  expect(normalizeCoordinateSystem(42)).toBe(42);
});

test('Tile3DLayer', async () => {
  const testCases: LayerTestCase<Tile3DLayer>[] = [
    {
      title: 'Tile3DLayer initial load',
      props: {
        data: './test/data/3d-tiles/tileset.json',
        getPointColor: [0, 0, 0]
      },
      onBeforeUpdate: () => console.log('inital load'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers[0], 'Renders sub layers').toBeTruthy();
        }
      }
    },
    {
      title: 'Tile3DLayer update opacity',
      updateProps: {
        opacity: 0.5
      },
      onBeforeUpdate: () => console.log('update opacity'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers[0].props.opacity, 'Updated sub layer props').toBe(0.5);
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
    onError: err => expect(err).toBeFalsy()
  });
});
