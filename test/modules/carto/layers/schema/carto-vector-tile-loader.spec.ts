// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import CartoVectorTileLoader from '@deck.gl/carto/layers/schema/carto-vector-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoVectorTileLoader', () => {
  const loader = CartoVectorTileLoader as LoaderWithParser;

  expect(loader, 'CartoVectorTileLoader should be defined').toBeTruthy();
  expect(loader.name, 'Should have correct name').toBe('CARTO Vector Tile');
  expect(typeof loader.parse, 'Should have parse method').toBe('function');
  expect(typeof loader.parseSync, 'Should have parseSync method').toBe('function');
  expect(loader.worker, 'worker property should be true').toBe(true);
});
