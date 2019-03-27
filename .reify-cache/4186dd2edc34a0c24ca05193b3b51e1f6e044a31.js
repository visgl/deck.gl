"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var Component;module.link('@deck.gl/core/lifecycle/component',{default(v){Component=v}},1);


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

test('Component#imports', t => {
  t.ok(Component, 'Component import ok');
  t.end();
});
