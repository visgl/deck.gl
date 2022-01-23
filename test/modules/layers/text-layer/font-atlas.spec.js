import test from 'tape-promise/tape';

import {setFontAtlasCacheLimit} from '@deck.gl/layers';

test('setFontAtlasCacheLimit', t => {
  setFontAtlasCacheLimit(10);
  t.ok(true, 'setFontAtlasCacheLimit is called without error');
  t.end();
});

test('setFontAtlasCacheLimit - null argument', t => {
  let didThrow = false;

  try {
    setFontAtlasCacheLimit(null);
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown when null argument passed');
  t.end();
});

test('setFontAtlasCacheLimit - invalid type argument', t => {
  let didThrow = false;

  try {
    setFontAtlasCacheLimit('Three');
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown an exception when argument other than string passed');
  t.end();
});

test('setFontAtlasCacheLimit - less than hard limit', t => {
  let didThrow = false;

  try {
    setFontAtlasCacheLimit(2);
  } catch (e) {
    didThrow = true;
  }

  t.ok(didThrow, 'exceptioh was thrown an exception when a limit less than hard limit passed');
  t.end();
});
