import test from 'tape-catch';

import {parsePropTypes} from '@deck.gl/core/lifecycle/prop-types';

const ARRAY = [1, 2, 3];
const TYPED_ARRAY = new Float32Array(3);
const OBJECT = {a: 1, b: 2};
const FUNCTION = x => x.position;

const KNOWN_TYPES = ['boolean', 'color', 'accessor', 'array', 'function'];

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
    propTypes: {prop: {name: 'prop', type: 'number', value: 1}},
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
  },
  {
    title: 'color prop',
    props: {prop: {type: 'color', value: ARRAY}},
    propTypes: {prop: {name: 'prop', type: 'color', value: ARRAY}},
    defaultProps: {prop: ARRAY}
  },
  {
    title: 'accessor prop',
    props: {prop: {type: 'accessor', value: FUNCTION}},
    propTypes: {prop: {name: 'prop', type: 'accessor', value: FUNCTION}},
    defaultProps: {prop: FUNCTION}
  }
];

function validatePropType(result, expected) {
  for (const propName in expected) {
    const propType = result[propName];
    const expectedPropType = expected[propName];
    const key = Object.keys(expectedPropType).find(k => propType[k] !== expectedPropType[k]);
    if (key) {
      return `${key}: ${propType[key]}, expected ${expectedPropType[key]}`;
    }
    if (KNOWN_TYPES.includes(propType.type) && typeof propType.equal !== 'function') {
      return `equal is not a function`;
    }
  }
  return null;
}

test('parsePropTypes#import', t => {
  t.ok(parsePropTypes, 'parsePropTypes imported OK');
  t.end();
});

test('parsePropTypes#tests', t => {
  for (const tc of TEST_CASES) {
    const {propTypes, defaultProps} = parsePropTypes(tc.props);
    const invalidMessage = validatePropType(propTypes, tc.propTypes);
    if (invalidMessage) {
      t.fail(`parsePropTypes ${tc.title}: ${invalidMessage}`);
    } else {
      t.pass(`parsePropTypes ${tc.title} returned expected prop types`);
    }
    t.deepEqual(
      defaultProps,
      tc.defaultProps,
      `parsePropTypes ${tc.title} returned expected default props`
    );
  }
  t.end();
});
