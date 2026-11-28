// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {GlobeViewport, WebMercatorViewport} from '@deck.gl/core';
import {
  getCoverageFloors,
  getCoverageTileIndices
} from '../../../../modules/geo-layers/src/tileset-2d/coverage';

const viewState = {longitude: -77.06753216318891, latitude: 38.94628276371387, zoom: 12};
const hierarchy = new Tileset2D({getTileData: () => null});
const FLAT = {coverageZoom: 0, fallbackZoom: 0};
const GLOBE = {coverageZoom: 6, fallbackZoom: 4};

function getRanks(indices: {x: number; y: number; z: number}[], floors: typeof FLAT) {
  const result = getCoverageTileIndices(indices, floors, hierarchy);
  return Object.fromEntries(Array.from(result, ([id, {rank}]) => [id, rank]));
}

test('getCoverageFloors', () => {
  expect(getCoverageFloors(new WebMercatorViewport(viewState)), 'flat').toEqual(FLAT);
  expect(getCoverageFloors(new WebMercatorViewport(viewState), 2), 'flat minZoom').toEqual({
    coverageZoom: 2,
    fallbackZoom: 2
  });
  expect(
    getCoverageFloors(new WebMercatorViewport({...viewState, resolution: 36})),
    'subdivided flat viewport'
  ).toEqual(FLAT);
  expect(getCoverageFloors(new GlobeViewport(viewState)), 'globe').toEqual(GLOBE);
  expect(getCoverageFloors(new GlobeViewport(viewState), 8), 'globe minZoom').toEqual({
    coverageZoom: 8,
    fallbackZoom: 8
  });
});

test('getCoverageTileIndices#flat', () => {
  expect(getRanks([{x: 1171, y: 1566, z: 12}], FLAT), 'parent and root').toEqual({
    '585-783-11': 0,
    '0-0-0': 1
  });
  expect(
    getRanks(
      [
        {x: 0, y: 0, z: 2},
        {x: 1, y: 0, z: 2}
      ],
      FLAT
    ),
    'siblings share their parent'
  ).toEqual({'0-0-1': 0, '0-0-0': 1});
  expect(
    getRanks(
      [
        {x: 0, y: 0, z: 3},
        {x: 1, y: 1, z: 1}
      ],
      FLAT
    ),
    'keeps the lowest rank of a shared ancestor'
  ).toEqual({'0-0-2': 0, '0-0-0': 0});
  expect(
    getRanks(
      [
        {x: 0, y: 0, z: 2},
        {x: 0, y: 0, z: 1}
      ],
      FLAT
    ),
    'skips selected ancestors'
  ).toEqual({'0-0-0': 0});
  expect(getRanks([{x: 0, y: 0, z: 0}], FLAT), 'root has no ancestors').toEqual({});
});

test('getCoverageTileIndices#globe', () => {
  expect(getRanks([{x: 1171, y: 1566, z: 12}], GLOBE), 'parent, coverage and fallback').toEqual({
    '585-783-11': 0,
    '18-24-6': 1,
    '4-6-4': 2
  });
  expect(getRanks([{x: 36, y: 48, z: 7}], GLOBE), 'parent at the coverage floor').toEqual({
    '18-24-6': 0,
    '4-6-4': 2
  });
  expect(getRanks([{x: 18, y: 24, z: 6}], GLOBE), 'fallback below the coverage floor').toEqual({
    '4-6-4': 2
  });
  expect(getRanks([{x: 4, y: 6, z: 4}], GLOBE), 'nothing below the fallback floor').toEqual({});
});
