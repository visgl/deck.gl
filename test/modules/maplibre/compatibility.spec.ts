// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  getMapLibreElevation,
  getMapLibreProjection,
  getMapLibreRenderParameters
} from '../../../modules/maplibre/src/compatibility';

import type {Map as MapLibreMap} from 'maplibre-gl';
import {expect, test} from 'vitest';

test('MapLibre compatibility normalizes public APIs', () => {
  const renderParameters = {nearZ: 1, farZ: 100};
  const v4Map = {
    getCameraTargetElevation: () => 40
  } as unknown as MapLibreMap;
  const v5Map = {
    getCenterElevation: () => 50,
    getProjection: () => ({type: 'globe'})
  } as unknown as MapLibreMap;

  expect(getMapLibreElevation(v4Map)).toBe(40);
  expect(getMapLibreElevation(v5Map)).toBe(50);
  expect(getMapLibreProjection(v4Map)).toBe('mercator');
  expect(getMapLibreProjection(v5Map)).toBe('globe');
  expect(getMapLibreRenderParameters(renderParameters)).toBe(renderParameters);
  expect(getMapLibreRenderParameters([], renderParameters)).toBe(renderParameters);
  expect(() => getMapLibreRenderParameters([])).toThrow('MapLibre GL JS 4.5.1 or later');
});
