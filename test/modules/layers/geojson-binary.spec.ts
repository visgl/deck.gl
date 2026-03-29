// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {geojsonToBinary} from '@loaders.gl/gis';
import {calculatePickingColors} from '@deck.gl/layers/geojson-layer/geojson-binary';
import {Layer} from '@deck.gl/core';
import {geoJSONData, pickingColorsSample} from './data/fixtures';

const geoJSONBinaryData = geojsonToBinary(geoJSONData);
const dummyLayer = new Layer();

test('calculatePickingColors', () => {
  const customPickingColors = calculatePickingColors(
    geoJSONBinaryData,
    dummyLayer.encodePickingColor
  );
  expect(
    Object.keys(customPickingColors),
    'creates a picking color object for the three types of geometry'
  ).toEqual(['points', 'lines', 'polygons']);
  expect(
    customPickingColors.polygons,
    'creates a right picking colors array for binary geojson'
  ).toEqual(pickingColorsSample);
});
