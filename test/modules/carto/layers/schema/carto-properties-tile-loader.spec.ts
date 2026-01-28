// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import CartoPropertiesTileLoader from '@deck.gl/carto/layers/schema/carto-properties-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoPropertiesTileLoader', () => {
  const loader = CartoPropertiesTileLoader as LoaderWithParser;

  expect(loader, 'CartoPropertiesTileLoader should be defined').toBeTruthy();
  expect(loader.name, 'Should have correct name').toBe('CARTO Properties Tile');
  expect(typeof loader.parse, 'Should have parse method').toBe('function');
  expect(typeof loader.parseSync, 'Should have parseSync method').toBe('function');
  expect(loader.worker, 'worker property should be true').toBe(true);
});
