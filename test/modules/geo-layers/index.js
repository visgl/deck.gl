// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';

import {
  GreatCircleLayer,
  H3HexagonLayer,
  H3ClusterLayer,
  S2Layer,
  TileLayer,
  TripsLayer,
  TerrainLayer
} from '@deck.gl/geo-layers';

test('Top-level imports', t => {
  t.ok(GreatCircleLayer, 'GreatCircleLayer symbol imported');
  t.ok(S2Layer, 'S2Layer symbol imported');
  t.ok(H3HexagonLayer, 'H3HexagonLayer symbol imported');
  t.ok(H3ClusterLayer, 'H3ClusterLayer symbol imported');
  t.ok(TileLayer, 'TileLayer symbol imported');
  t.ok(TripsLayer, 'TripsLayer symbol imported');
  t.ok(TerrainLayer, 'TerrainLayer symbol imported');
  t.end();
});

import './tile-layer';
import './s2-layer.spec';
import './trips-layer.spec';
import './great-circle-layer.spec';
import './h3-layers.spec';
import './tile-3d-layer';
import './terrain-layer.spec';
import './mvt-layer.spec';
