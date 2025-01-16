// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import CartoSpatialTileLoader from '@deck.gl/carto/layers/schema/carto-spatial-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';

test('CartoSpatialTileLoader', t => {
  const loader = CartoSpatialTileLoader as LoaderWithParser;

  t.ok(loader, 'CartoSpatialTileLoader should be defined');
  t.equals(loader.name, 'CARTO Spatial Tile', 'Should have correct name');
  t.equals(typeof loader.parse, 'function', 'Should have parse method');
  t.equals(typeof loader.parseSync, 'function', 'Should have parseSync method');
  t.equals(loader.worker, true, 'worker property should be true');
  t.end();
});
