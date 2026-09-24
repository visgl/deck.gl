// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {shouldComposeModelMatrix} from '@deck.gl/mesh-layers/utils/matrix';

test('shouldComposeModelMatrix', () => {
  expect(
    shouldComposeModelMatrix({isGeospatial: false}, 'default'),
    'Should composeModelMatrix for cartesian.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({isGeospatial: true}, 'default'),
    'Should not composeModelMatrix for lnglat.'
  ).toBeFalsy();
  expect(
    shouldComposeModelMatrix({}, 'cartesian'),
    'Should composeModelMatrix for cartesian.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({}, 'meter-offsets'),
    'Should composeModelMatrix for meter_offsets.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({}, 'lnglat-offsets'),
    'Should not composeModelMatrix for lnglat_offsets.'
  ).toBeFalsy();
});
