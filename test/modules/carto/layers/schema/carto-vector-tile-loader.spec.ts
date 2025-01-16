// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import CartoVectorTileLoader from '@deck.gl/carto/layers/schema/carto-vector-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoVectorTileLoader', t => {
  const loader = CartoVectorTileLoader as LoaderWithParser;

  t.ok(loader, 'CartoVectorTileLoader should be defined');
  t.equals(loader.name, 'CARTO Vector Tile', 'Should have correct name');
  t.equals(typeof loader.parse, 'function', 'Should have parse method');
  t.equals(typeof loader.parseSync, 'function', 'Should have parseSync method');
  t.equals(loader.worker, true, 'worker property should be true');
  t.end();
});
