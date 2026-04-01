// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {shouldComposeModelMatrix} from '@deck.gl/mesh-layers/utils/matrix';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

test('shouldComposeModelMatrix', () => {
  expect(
    shouldComposeModelMatrix({isGeospatial: false}, COORDINATE_SYSTEM.DEFAULT),
    'Should composeModelMatrix for cartesian.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({isGeospatial: true}, COORDINATE_SYSTEM.DEFAULT),
    'Should not composeModelMatrix for lnglat.'
  ).toBeFalsy();
  expect(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.IDENTITY),
    'Should composeModelMatrix for identity.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.METER_OFFSETS),
    'Should composeModelMatrix for meter_offsets.'
  ).toBeTruthy();
  expect(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.LNGLAT_OFFSETS),
    'Should not composeModelMatrix for lnglat_offsets.'
  ).toBeFalsy();
});
