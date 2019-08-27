import test from 'tape-catch';
import evaluateChildren from '@deck.gl/react/utils/evaluate-children';
import React, {createElement} from 'react';

const TEST_CHILD_PROPS = {zIndex: 1};

const TEST_CASES = [
  {
    title: 'empty child',
    input: null,
    count: 0
  },
  {
    title: 'function child',
    // eslint-disable-next-line react/display-name
    input: props => createElement('div', Object.assign({id: 'test-func'}, props)),
    count: 1,
    expected: {
      id: 'test-func',
      zIndex: 1
    }
  },
  {
    title: 'React elements',
    input: [
      createElement('div', {id: 'test-el-1', className: 'test'}),
      createElement('div', {id: 'test-el-2', className: 'test'})
    ],
    count: 2,
    expected: {
      className: 'test',
      zIndex: 1
    }
  }
];

test('evaluateChildren', t => {
  for (const testCase of TEST_CASES) {
    const result = evaluateChildren(testCase.input, TEST_CHILD_PROPS);

    t.is(
      React.Children.count(result),
      testCase.count,
      `${testCase.title} returns ${testCase.count} child(ren)`
    );

    React.Children.forEach(result, child => {
      for (const propName in testCase.expected) {
        t.is(child.props[propName], testCase.expected[propName], `${testCase.title}: ${propName}`);
      }
    });
  }

  t.end();
});
