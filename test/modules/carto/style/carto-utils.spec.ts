// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getAttrValue} from '@deck.gl/carto/style/utils';

const DATA = {
  properties: {
    cartodb_id: 1
  }
};

const EXPECTED = 1;

const OK_TEST_CASES = ['cartodb_id', row => row.properties.cartodb_id];
const ERROR_TEST_CASES = [1, null, undefined];

test('getAttrValue', () => {
  for (const tc of OK_TEST_CASES) {
    const func = getAttrValue(tc, DATA);
    expect(func, `getAttrValue correctly returns ${EXPECTED}`).toEqual(EXPECTED);
  }
});

test('getAttrValue#invalidParams', () => {
  for (const tc of ERROR_TEST_CASES) {
    expect(() => getAttrValue(tc, DATA), `throws on invalid type ${typeof tc}`).toThrow();
  }
});
