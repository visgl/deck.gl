import test from 'tape-catch';

import {parsePropTypes} from '@deck.gl/core/lifecycle/prop-types';

const ARRAY = [1, 2, 3];
const TYPED_ARRAY = new Float32Array(3);
const OBJECT = {a: 1, b: 2};
const FUNCTION = x => x.position;

const TEST_CASES = [
  {
    title: 'boolean default prop',
    props: {prop: true},
    propTypes: {prop: {name: 'prop', type: 'boolean', value: true}},
    defaultProps: {prop: true}
  },
  {
    title: 'numeric default prop',
    props: {prop: 1},
    propTypes: {prop: {name: 'prop', type: 'number', value: 1, min: 0, max: 1}},
    defaultProps: {prop: 1}
  },
  {
    title: 'array default prop',
    props: {prop: ARRAY},
    propTypes: {prop: {name: 'prop', type: 'array', value: ARRAY}},
    defaultProps: {prop: ARRAY}
  },
  {
    title: 'typed array default prop',
    props: {prop: TYPED_ARRAY},
    propTypes: {prop: {name: 'prop', type: 'array', value: TYPED_ARRAY}},
    defaultProps: {prop: TYPED_ARRAY}
  },
  {
    title: 'object default prop',
    props: {prop: OBJECT},
    propTypes: {prop: {name: 'prop', type: 'object', value: OBJECT}},
    defaultProps: {prop: OBJECT}
  },
  {
    title: 'function default prop',
    props: {prop: FUNCTION},
    propTypes: {prop: {name: 'prop', type: 'function', value: FUNCTION}},
    defaultProps: {prop: FUNCTION}
  }
];

test('parsePropTypes#import', t => {
  t.ok(parsePropTypes, 'parsePropTypes imported OK');
  t.end();
});

test('parsePropTypes#tests', t => {
  for (const tc of TEST_CASES) {
    const {propTypes, defaultProps} = parsePropTypes(tc.props);
    t.deepEqual(propTypes, tc.propTypes, `parsePropTypes ${tc.title} returned expected prop types`);
    t.deepEqual(
      defaultProps,
      tc.defaultProps,
      `parsePropTypes ${tc.title} returned expected default props`
    );
  }
  t.end();
});
