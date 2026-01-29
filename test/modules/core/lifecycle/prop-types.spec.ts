// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {parsePropTypes} from '@deck.gl/core/lifecycle/prop-types';

test('parsePropTypes#import', () => {
  expect(parsePropTypes, 'parsePropTypes imported OK').toBeTruthy();
});

test('parsePropTypes#tests', () => {
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

  for (const tc of TEST_CASES) {
    const {propTypes, defaultProps} = parsePropTypes(tc.props);
    const invalidMessage = validatePropType(propTypes, tc.propTypes);
    if (invalidMessage) {
      throw new Error(`parsePropTypes ${tc.title}: ${invalidMessage}`);
    } else {
    }
    expect(defaultProps, `parsePropTypes ${tc.title} returned expected default props`).toEqual(
      tc.defaultProps
    );
  }
});

function validate(value, propType) {
  if (propType.validate) {
    return propType.validate(value, propType);
  }
  return true;
}

function compare(value1, value2, propType) {
  if (propType.equal) {
    return propType.equal(value1, value2, propType);
  }
  return value1 === value2;
}

test('propType#number', () => {
  const {propTypes} = parsePropTypes({
    numberDefault: {type: 'number', value: 0},
    numberWithLowerBound: {type: 'number', value: 1, min: 0},
    numberWithBounds: {type: 'number', value: 1, min: 0, max: 1}
  });

  expect(validate(-1, propTypes.numberDefault), 'validates number').toBeTruthy();
  expect(validate('A', propTypes.numberDefault), 'validates number').toBeFalsy();
  expect(
    validate(2, propTypes.numberWithLowerBound),
    'validates number with lower bound'
  ).toBeTruthy();
  expect(
    validate(-1, propTypes.numberWithLowerBound),
    'validates number with lower bound'
  ).toBeFalsy();
  expect(validate(0.5, propTypes.numberWithBounds), 'validates number with bounds').toBeTruthy();
  expect(validate(2, propTypes.numberWithBounds), 'validates number with bounds').toBeFalsy();
});

test('propType#object', () => {
  const {propTypes} = parsePropTypes({
    objectDefault: {},
    objectIgnored: {type: 'object', value: {}, ignore: true},
    objectCompare: {type: 'object', value: {}, compare: true},
    objectCompare2: {type: 'object', value: {}, compare: 2}
  });

  const OBJECT = {a: 1};
  expect(compare(OBJECT, OBJECT, propTypes.objectDefault), 'default compare').toBeTruthy();
  expect(compare(OBJECT, {...OBJECT}, propTypes.objectDefault), 'default compare').toBeFalsy();
  expect(compare(OBJECT, {}, propTypes.objectIgnored), 'ignored').toBeTruthy();
  expect(compare(OBJECT, {...OBJECT}, propTypes.objectCompare), 'deep compare').toBeTruthy();
  expect(
    compare({OBJECT}, {OBJECT: {...OBJECT}}, propTypes.objectCompare),
    'deep compare'
  ).toBeFalsy();
  expect(
    compare({OBJECT}, {OBJECT: {...OBJECT}}, propTypes.objectCompare2),
    'deep compare depth 2'
  ).toBeTruthy();
});

test('propType#array', () => {
  const {propTypes} = parsePropTypes({
    arrayDefault: {type: 'array', value: []},
    arrayOptional: {type: 'array', value: null, optional: true},
    arrayIgnored: {type: 'array', value: [], ignore: true},
    arrayCompare: {type: 'array', value: [], compare: true},
    arrayCompare2: {type: 'array', value: [], compare: 2}
  });

  const ARRAY = [1];

  expect(validate(ARRAY, propTypes.arrayDefault), 'default validate').toBeTruthy();
  expect(validate(null, propTypes.arrayDefault), 'default validate').toBeFalsy();
  expect(validate({}, propTypes.arrayDefault), 'default validate').toBeFalsy();
  expect(validate(null, propTypes.arrayOptional), 'optional validate').toBeTruthy();
  expect(validate({}, propTypes.arrayOptional), 'optional validate').toBeFalsy();

  expect(compare(ARRAY, ARRAY, propTypes.arrayDefault), 'default compare').toBeTruthy();
  expect(compare(ARRAY, [...ARRAY], propTypes.arrayDefault), 'default compare').toBeFalsy();
  expect(compare(ARRAY, [...ARRAY], propTypes.arrayCompare), 'deep compare').toBeTruthy();
  expect(compare([ARRAY], [[...ARRAY]], propTypes.arrayCompare), 'deep compare').toBeFalsy();
  expect(
    compare([ARRAY], [[...ARRAY]], propTypes.arrayCompare2),
    'deep compare depth 2'
  ).toBeTruthy();
});

test('propType#function', () => {
  const {propTypes} = parsePropTypes({
    functionDefault: {type: 'function', value: () => {}},
    functionOptional: {type: 'function', value: null, optional: true},
    functionNotIgnored: {type: 'function', value: () => {}, ignore: false}
  });

  const FUNCTION = () => true;

  expect(validate(FUNCTION, propTypes.functionDefault), 'default validate').toBeTruthy();
  expect(validate(null, propTypes.functionDefault), 'default validate').toBeFalsy();
  expect(validate({}, propTypes.functionDefault), 'default validate').toBeFalsy();
  expect(validate(null, propTypes.functionOptional), 'optional validate').toBeTruthy();
  expect(validate({}, propTypes.functionOptional), 'optional validate').toBeFalsy();

  expect(
    compare(FUNCTION, () => {}, propTypes.functionDefault),
    'default compare'
  ).toBeTruthy();
  expect(compare(FUNCTION, FUNCTION, propTypes.functionNotIgnored), 'do compare').toBeTruthy();
  expect(
    compare(FUNCTION, () => {}, propTypes.functionNotIgnored),
    'do compare'
  ).toBeFalsy();
});

test('propType#accessor', () => {
  const {propTypes} = parsePropTypes({
    accessorArray: {type: 'accessor', value: [0, 0, 0, 255]},
    accessorNumber: {type: 'accessor', value: 1},
    accessorFunc: {type: 'accessor', value: d => d.size}
  });

  expect(
    validate(d => d.color, propTypes.accessorArray),
    'validate array accessor'
  ).toBeTruthy();
  expect(validate([0, 0, 0], propTypes.accessorArray), 'validate array accessor').toBeTruthy();
  expect(validate(0, propTypes.accessorArray), 'validate array accessor').toBeFalsy();

  expect(
    validate(d => d.elevation, propTypes.accessorNumber),
    'validate number accessor'
  ).toBeTruthy();
  expect(validate(1000, propTypes.accessorNumber), 'validate number accessor').toBeTruthy();
  expect(validate({}, propTypes.accessorNumber), 'validate number accessor').toBeFalsy();

  expect(
    validate(d => d.scale, propTypes.accessorFunc),
    'validate func accessor'
  ).toBeTruthy();
  expect(validate(0, propTypes.accessorFunc), 'validate func accessor').toBeFalsy();

  expect(
    compare(
      d => d.color,
      d => d.color,
      propTypes.accessorArray
    ),
    'compare array accessor'
  ).toBeTruthy();
  expect(
    compare([0, 0, 0], [0, 0, 0], propTypes.accessorArray),
    'compare array accessor'
  ).toBeTruthy();
});
