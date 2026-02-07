// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {TextLayer} from '@deck.gl/layers';

test('TextLayer - fontAtlasCacheLimit', () => {
  TextLayer.fontAtlasCacheLimit = 10;
  expect(true, 'fontAtlasCacheLimit is set without error').toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - null argument', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = null;
  } catch (e) {
    didThrow = true;
  }

  expect(didThrow, 'exceptioh was thrown when null argument passed').toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - invalid type argument', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 'Three';
  } catch (e) {
    didThrow = true;
  }

  expect(
    didThrow,
    'exceptioh was thrown an exception when argument other than string passed'
  ).toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - less than hard limit', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 2;
  } catch (e) {
    didThrow = true;
  }

  expect(
    didThrow,
    'exceptioh was thrown an exception when a limit less than hard limit passed'
  ).toBeTruthy();
});
