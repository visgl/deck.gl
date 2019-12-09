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
import '@luma.gl/core';

import DeckGL from 'deck.gl';
import * as deck from 'deck.gl';

import * as layers from '@deck.gl/layers';
import * as aggregationLayers from '@deck.gl/aggregation-layers';
import * as geoLayers from '@deck.gl/geo-layers';
import * as meshLayers from '@deck.gl/mesh-layers';

import * as core from '@deck.gl/core';
import * as json from '@deck.gl/json';
import * as googleMaps from '@deck.gl/google-maps';
import * as mapbox from '@deck.gl/mapbox';
import * as react from '@deck.gl/react';
import * as testUtils from '@deck.gl/test-utils';

test('Top-level imports', t0 => {
  const hasEmptyExports = obj => {
    for (const key in obj) {
      if (!obj[key]) {
        return key;
      }
    }
    return false;
  };

  test('import "deck.gl"', t => {
    t.notOk(hasEmptyExports(deck), 'No empty top-level export in deck.gl');
    t.notOk(hasEmptyExports(core), 'No empty top-level export in @deck.gl/core');
    t.end();
  });

  test('import layers', t => {
    t.notOk(hasEmptyExports(layers), 'No empty top-level export in @deck.gl/layers');
    t.notOk(
      hasEmptyExports(aggregationLayers),
      'No empty top-level export in @deck.gl/aggregation-layers'
    );
    t.notOk(hasEmptyExports(geoLayers), 'No empty top-level export in @deck.gl/geo-layers');
    t.notOk(hasEmptyExports(meshLayers), 'No empty top-level export in @deck.gl/mesh-layers');
    t.end();
  });

  test('import utilities', t => {
    t.notOk(hasEmptyExports(json), 'No empty top-level export in @deck.gl/json');
    t.notOk(hasEmptyExports(googleMaps), 'No empty top-level export in @deck.gl/google-maps');
    t.notOk(hasEmptyExports(mapbox), 'No empty top-level export in @deck.gl/mapbox');
    t.notOk(hasEmptyExports(react), 'No empty top-level export in @deck.gl/react');
    t.notOk(hasEmptyExports(testUtils), 'No empty top-level export in @deck.gl/test-utils');
    t.end();
  });

  test('selected imports', t => {
    t.ok(deck.Layer, 'Layer symbol imported');
    t.ok(deck.ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(deck.ScreenGridLayer, 'ScreenGridLayer symbol imported');
    t.ok(deck.ArcLayer, 'ArcLayer symbol imported');
    t.ok(deck.LineLayer, 'LineLayer symbol imported');

    t.ok(Number.isFinite(deck.COORDINATE_SYSTEM.LNGLAT), 'COORDINATE_SYSTEM.LNGLAT imported');
    t.ok(
      Number.isFinite(deck.COORDINATE_SYSTEM.METER_OFFSETS),
      'COORDINATE_SYSTEM.METERS imported'
    );
    t.ok(Number.isFinite(deck.COORDINATE_SYSTEM.CARTESIAN), 'COORDINATE_SYSTEM.CARTESIAN imported');
    t.end();
  });

  test('deck.gl default import', t => {
    t.ok(DeckGL, 'DeckGL symbol imported from /react');
    t.end();
  });

  t0.end();
});

test('deck.gl re-exports', t => {
  const findMissingExports = (source, target) => {
    const missingExports = [];
    for (const key in source) {
      // Exclude experimental exports
      if (key[0] !== '_' && key !== 'experimental' && target[key] !== source[key]) {
        missingExports.push(key);
      }
    }
    return missingExports.length ? missingExports : null;
  };

  t.notOk(findMissingExports(core, deck), 'deck.gl re-exports everything from @deck.gl/core');
  t.notOk(findMissingExports(layers, deck), 'deck.gl re-exports everything from @deck.gl/layers');
  t.notOk(
    findMissingExports(aggregationLayers, deck),
    'deck.gl re-exports everything from @deck.gl/aggregation-layers'
  );
  t.notOk(
    findMissingExports(geoLayers, deck),
    'deck.gl re-exports everything from @deck.gl/geo-layers'
  );
  t.notOk(
    findMissingExports(meshLayers, deck),
    'deck.gl re-exports everything from @deck.gl/mesh-layers'
  );

  t.end();
});
