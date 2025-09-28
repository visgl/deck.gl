// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import CartoPropertiesTileLoader from '@deck.gl/carto/layers/schema/carto-properties-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoPropertiesTileLoader', t => {
  const loader = CartoPropertiesTileLoader as LoaderWithParser;

  t.ok(loader, 'CartoPropertiesTileLoader should be defined');
  t.equals(loader.name, 'CARTO Properties Tile', 'Should have correct name');
  t.equals(typeof loader.parse, 'function', 'Should have parse method');
  t.equals(typeof loader.parseSync, 'function', 'Should have parseSync method');
  t.equals(loader.worker, true, 'worker property should be true');
  t.end();
});
