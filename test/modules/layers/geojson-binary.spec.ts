// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {convertGeojsonToBinaryFeatureCollection} from '@loaders.gl/core/geoarrow';
import {calculatePickingIndexes} from '@deck.gl/layers/geojson-layer/geojson-binary';
import {geoJSONData, pickingIndexesSample} from './data/fixtures';

const geoJSONBinaryData = convertGeojsonToBinaryFeatureCollection(geoJSONData);

test('calculatePickingIndexes', () => {
  const customPickingIndexes = calculatePickingIndexes(geoJSONBinaryData);
  expect(
    Object.keys(customPickingIndexes),
    'creates a picking index object for the three types of geometry'
  ).toEqual(['points', 'lines', 'polygons']);
  expect(
    customPickingIndexes.polygons,
    'creates a right picking indexes array for binary geojson'
  ).toEqual(pickingIndexesSample);
});
