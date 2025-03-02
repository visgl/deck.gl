// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';
import {getAttrValue} from '@deck.gl/carto/style/utils';

const DATA = {
  properties: {
    cartodb_id: 1
  }
};

const EXPECTED = 1;

const OK_TEST_CASES = ['cartodb_id', row => row.properties.cartodb_id];
const ERROR_TEST_CASES = [1, null, undefined];

test('getAttrValue', t => {
  for (const tc of OK_TEST_CASES) {
    const func = getAttrValue(tc, DATA);
    t.deepEquals(func, EXPECTED, `getAttrValue correctly returns ${EXPECTED}`);
  }

  t.end();
});

test('getAttrValue#invalidParams', t => {
  for (const tc of ERROR_TEST_CASES) {
    t.throws(() => getAttrValue(tc, DATA), `throws on invalid type ${typeof tc}`);
  }

  t.end();
});
