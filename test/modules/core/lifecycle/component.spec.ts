// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
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

test('Component#immutable updates and typed comparison', () => {
  class Options extends Component<{id?: string; size?: number; values?: number[]}> {
    static defaultProps = {
      id: 'options',
      size: 1,
      values: {type: 'array', value: [], compare: true}
    };
    update(props, replace = false) {
      return replace ? this._setProps(props) : this._setProps(this.props, props);
    }
    compare(props) {
      return this._compareProps(props);
    }
  }
  const options = new Options({size: 2, values: [1, 2]});
  const previous = options.props;
  expect(options.id).toBe('options');
  expect(options.update({values: [1, 2]})).toBe(false);
  expect(Object.isFrozen(options.props)).toBe(true);
  expect(options.props).not.toBe(previous);
  expect(options.update({size: 3})).toBeTruthy();
  expect(previous.size).toBe(2);
  expect(options.update({}, true)).toBeTruthy();
  expect(options.props.size).toBe(1);
  expect(options.clone({size: 4})).toBeInstanceOf(Options);
  expect(options.clone({size: 4}).props.size).toBe(4);

  class OtherOptions extends Options {
    static defaultProps = {...Options.defaultProps, size: 5};
  }
  expect(new OtherOptions().compare(options.props)).toBeTruthy();
});
