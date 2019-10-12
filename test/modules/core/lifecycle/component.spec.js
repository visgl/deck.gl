import test from 'tape-promise/tape';
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

test('Component#imports', t => {
  t.ok(Component, 'Component import ok');
  t.end();
});
