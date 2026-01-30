// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import {log} from '@deck.gl/core';
import {createGoogleMapsDeckOverlay} from '@deck.gl/jupyter-widget/playground/utils/google-maps-utils';

test('jupyter-widget: Google Maps base', () => {
  vi.spyOn(log, 'warn');
  const overlay = createGoogleMapsDeckOverlay({props: {}});
  expect(
    log.warn,
    'should produce a warning message if no Google Maps API key is provided'
  ).toHaveBeenCalled();
  expect(!overlay, 'Absent Google Maps API key creates null overlay').toBeTruthy();
  log.warn.restore();
});
