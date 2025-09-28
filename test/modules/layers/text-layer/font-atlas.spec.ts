// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {TextLayer} from '@deck.gl/layers';

test('TextLayer - fontAtlasCacheLimit', t => {
  TextLayer.fontAtlasCacheLimit = 10;
  t.ok(true, 'fontAtlasCacheLimit is set without error');
  t.end();
});

test('TextLayer - fontAtlasCacheLimit - null argument', t => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = null;
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown when null argument passed');
  t.end();
});

test('TextLayer - fontAtlasCacheLimit - invalid type argument', t => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 'Three';
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown an exception when argument other than string passed');
  t.end();
});

test('TextLayer - fontAtlasCacheLimit - less than hard limit', t => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 2;
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown an exception when a limit less than hard limit passed');
  t.end();
});
