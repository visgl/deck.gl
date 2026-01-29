// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {makeSpy} from '@probe.gl/test-utils';

import {log} from '@deck.gl/core';
import {createGoogleMapsDeckOverlay} from '@deck.gl/jupyter-widget/playground/utils/google-maps-utils';

test('jupyter-widget: Google Maps base', () => {
  makeSpy(log, 'warn');
  const overlay = createGoogleMapsDeckOverlay({props: {}});
  expect(
    log.warn,
    'should produce a warning message if no Google Maps API key is provided'
  ).toHaveBeenCalled();
  expect(!overlay, 'Absent Google Maps API key creates null overlay').toBeTruthy();
  log.warn.restore();
});
