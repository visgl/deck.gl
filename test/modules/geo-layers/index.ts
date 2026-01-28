// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

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

test('Top-level imports', () => {
  expect(A5Layer, 'A5Layer symbol imported').toBeTruthy();
  expect(GreatCircleLayer, 'GreatCircleLayer symbol imported').toBeTruthy();
  expect(QuadkeyLayer, 'QuadkeyLayer symbol imported').toBeTruthy();
  expect(S2Layer, 'S2Layer symbol imported').toBeTruthy();
  expect(H3HexagonLayer, 'H3HexagonLayer symbol imported').toBeTruthy();
  expect(H3ClusterLayer, 'H3ClusterLayer symbol imported').toBeTruthy();
  expect(TileLayer, 'TileLayer symbol imported').toBeTruthy();
  expect(WMSLayer, 'WMSLayer symbol imported').toBeTruthy();
  expect(TripsLayer, 'TripsLayer symbol imported').toBeTruthy();
  expect(TerrainLayer, 'TerrainLayer symbol imported').toBeTruthy();
  expect(GeohashLayer, 'GeohashLayer symbol imported').toBeTruthy();
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
