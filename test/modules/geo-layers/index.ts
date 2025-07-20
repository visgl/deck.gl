// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {
  A5Layer,
  GreatCircleLayer,
  H3HexagonLayer,
  H3ClusterLayer,
  _WMSLayer as WMSLayer,
  QuadkeyLayer,
  S2Layer,
  TileLayer,
  TripsLayer,
  TerrainLayer,
  GeohashLayer
} from '@deck.gl/geo-layers';

test('Top-level imports', t => {
  t.ok(A5Layer, 'A5Layer symbol imported');
  t.ok(GreatCircleLayer, 'GreatCircleLayer symbol imported');
  t.ok(QuadkeyLayer, 'QuadkeyLayer symbol imported');
  t.ok(S2Layer, 'S2Layer symbol imported');
  t.ok(H3HexagonLayer, 'H3HexagonLayer symbol imported');
  t.ok(H3ClusterLayer, 'H3ClusterLayer symbol imported');
  t.ok(TileLayer, 'TileLayer symbol imported');
  t.ok(WMSLayer, 'WMSLayer symbol imported');
  t.ok(TripsLayer, 'TripsLayer symbol imported');
  t.ok(TerrainLayer, 'TerrainLayer symbol imported');
  t.ok(GeohashLayer, 'GeohashLayer symbol imported');
  t.end();
});

import './a5-layer.spec';
import './tile-layer';
import './wms-layer.spec';
import './quadkey-layer.spec';
import './s2-layer.spec';
import './trips-layer.spec';
import './great-circle-layer.spec';
import './h3-layers.spec';
import './tile-3d-layer';
import './terrain-layer.spec';
import './mvt-layer.spec';
import './geohash-layer.spec';

import './tileset-2d';
