// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import Component from '@deck.gl/core/lifecycle/component';

/* global fetch */
const EMPTY_ARRAY = Object.freeze([]);

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataComparator: null,
  dataTransform: data => data,
  fetch: url => fetch(url).then(response => response.json())
};

class TestComponent extends Component {
  constructor(...props) {
    super(...props);
  }
}

TestComponent.defaultProps = defaultProps;

test('Component#imports', () => {
  expect(Component, 'Component import ok').toBeTruthy();
});
