// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import CartoSpatialTileLoader from '@deck.gl/carto/layers/schema/carto-spatial-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoSpatialTileLoader', () => {
  const loader = CartoSpatialTileLoader as LoaderWithParser;

  expect(loader, 'CartoSpatialTileLoader should be defined').toBeTruthy();
  expect(loader.name, 'Should have correct name').toBe('CARTO Spatial Tile');
  expect(typeof loader.parse, 'Should have parse method').toBe('function');
  expect(typeof loader.parseSync, 'Should have parseSync method').toBe('function');
  expect(loader.worker, 'worker property should be true').toBe(true);
});
