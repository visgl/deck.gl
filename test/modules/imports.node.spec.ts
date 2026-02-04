// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import '@luma.gl/core';

import DeckGL from 'deck.gl';
import * as deck from 'deck.gl';

import * as layers from '@deck.gl/layers';
import * as aggregationLayers from '@deck.gl/aggregation-layers';
import * as carto from '@deck.gl/carto';
import * as geoLayers from '@deck.gl/geo-layers';
import * as meshLayers from '@deck.gl/mesh-layers';

import * as core from '@deck.gl/core';
import * as json from '@deck.gl/json';
import * as arcgis from '@deck.gl/arcgis';
import * as googleMaps from '@deck.gl/google-maps';
import * as mapbox from '@deck.gl/mapbox';
import * as react from '@deck.gl/react';
// Note: @deck.gl/test-utils requires WebGL and cannot be imported in Node
// import * as testUtils from '@deck.gl/test-utils';

describe('Top-level imports', () => {
  const hasEmptyExports = obj => {
    for (const key in obj) {
      if (obj[key] === undefined) {
        return key;
      }
    }
    return false;
  };

  test('import "deck.gl"', () => {
    expect(hasEmptyExports(deck), 'No empty top-level export in deck.gl').toBeFalsy();
    expect(hasEmptyExports(core), 'No empty top-level export in @deck.gl/core').toBeFalsy();
  });

  test('import layers', () => {
    expect(hasEmptyExports(layers), 'No empty top-level export in @deck.gl/layers').toBeFalsy();
    expect(
      hasEmptyExports(aggregationLayers),
      'No empty top-level export in @deck.gl/aggregation-layers'
    ).toBeFalsy();
    expect(hasEmptyExports(carto), 'No empty top-level export in @deck.gl/carto').toBeFalsy();
    expect(
      hasEmptyExports(geoLayers),
      'No empty top-level export in @deck.gl/geo-layers'
    ).toBeFalsy();
    expect(
      hasEmptyExports(meshLayers),
      'No empty top-level export in @deck.gl/mesh-layers'
    ).toBeFalsy();
  });

  test('import utilities', () => {
    expect(hasEmptyExports(json), 'No empty top-level export in @deck.gl/json').toBeFalsy();
    expect(hasEmptyExports(arcgis), 'No empty top-level export in @deck.gl/arcgis').toBeFalsy();
    expect(
      hasEmptyExports(googleMaps),
      'No empty top-level export in @deck.gl/google-maps'
    ).toBeFalsy();
    expect(hasEmptyExports(mapbox), 'No empty top-level export in @deck.gl/mapbox').toBeFalsy();
    expect(hasEmptyExports(react), 'No empty top-level export in @deck.gl/react').toBeFalsy();
    // Note: @deck.gl/test-utils requires WebGL and cannot be imported in Node
  });

  test('selected imports', () => {
    expect(deck.Layer, 'Layer symbol imported').toBeTruthy();
    expect(deck.ScatterplotLayer, 'ScatterplotLayer symbol imported').toBeTruthy();
    expect(deck.ScreenGridLayer, 'ScreenGridLayer symbol imported').toBeTruthy();
    expect(deck.ArcLayer, 'ArcLayer symbol imported').toBeTruthy();
    expect(deck.LineLayer, 'LineLayer symbol imported').toBeTruthy();

    expect(
      Number.isFinite(deck.COORDINATE_SYSTEM.LNGLAT),
      'COORDINATE_SYSTEM.LNGLAT imported'
    ).toBeTruthy();
    expect(
      Number.isFinite(deck.COORDINATE_SYSTEM.METER_OFFSETS),
      'COORDINATE_SYSTEM.METERS imported'
    ).toBeTruthy();
    expect(
      Number.isFinite(deck.COORDINATE_SYSTEM.CARTESIAN),
      'COORDINATE_SYSTEM.CARTESIAN imported'
    ).toBeTruthy();
  });

  test('deck.gl default import', () => {
    expect(DeckGL, 'DeckGL symbol imported from /react').toBeTruthy();
  });
});

test('deck.gl re-exports', () => {
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

  expect(
    findMissingExports(core, deck),
    'deck.gl re-exports everything from @deck.gl/core'
  ).toBeFalsy();
  expect(
    findMissingExports(layers, deck),
    'deck.gl re-exports everything from @deck.gl/layers'
  ).toBeFalsy();
  expect(
    findMissingExports(aggregationLayers, deck),
    'deck.gl re-exports everything from @deck.gl/aggregation-layers'
  ).toBeFalsy();
  expect(
    findMissingExports(geoLayers, deck),
    'deck.gl re-exports everything from @deck.gl/geo-layers'
  ).toBeFalsy();
  expect(
    findMissingExports(meshLayers, deck),
    'deck.gl re-exports everything from @deck.gl/mesh-layers'
  ).toBeFalsy();
});
