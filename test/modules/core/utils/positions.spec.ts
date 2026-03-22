// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {parsePosition, getPosition, evaluateLayoutExpression} from '@deck.gl/core/utils/positions';
import type {LayoutExpression} from '@deck.gl/core/utils/positions';

const EXPRESSION_TEST_CASES = [
  {title: 'number literal', value: 10, extent: 101, result: 10},
  {title: 'percent string', value: '10%', extent: 101, result: 10},
  {title: 'percent decimal string', value: '33.3%', extent: 100, result: 33},
  {title: 'pixel string', value: '10px', extent: 200, result: 10},
  {title: 'calc addition', value: 'calc(50% + 10px)', extent: 100, result: 60},
  {
    title: 'calc subtraction with parentheses',
    value: 'calc(100% - (25% + 10px))',
    extent: 200,
    result: 140
  },
  {
    title: 'calc whitespace and nesting',
    value: 'calc( (25% - 5px) + (10px - 5%) )',
    extent: 120,
    result: 29
  },
  {title: 'calc unary minus', value: 'calc(-10px + 50%)', extent: 100, result: 40},
  {title: 'calc uppercase and px spacing', value: 'CALC(75% - 10 px)', extent: 80, result: 50},
  {title: 'calc percent only', value: 'calc(25%)', extent: 101, result: 25}
];

const EVALUATE_TEST_CASES: {
  title: string;
  expression: LayoutExpression;
  extent: number;
  result: number;
}[] = [
  {
    title: 'binary addition tree',
    expression: {
      type: 'binary',
      operator: '+',
      left: {type: 'literal', value: 5},
      right: {type: 'percentage', value: 0.1}
    },
    extent: 120,
    result: 17
  },
  {
    title: 'binary subtraction tree',
    expression: {
      type: 'binary',
      operator: '-',
      left: {type: 'percentage', value: 0.75},
      right: {
        type: 'binary',
        operator: '+',
        left: {type: 'literal', value: 20},
        right: {type: 'percentage', value: 0.3}
      }
    },
    extent: 100,
    result: 25
  }
];

test('positions#import', t => {
  t.ok(parsePosition, 'parsePosition imported OK');
  t.ok(getPosition, 'getPosition imported OK');
  t.ok(evaluateLayoutExpression, 'evaluateLayoutExpression imported OK');
  t.end();
});

test('parsePosition#getPosition combinations', t => {
  for (const tc of EXPRESSION_TEST_CASES) {
    const expression = parsePosition(tc.value);
    const result = getPosition(expression, tc.extent);
    t.equal(result, tc.result, `parsePosition ${tc.title} returned expected result`);
  }
  t.end();
});

test('evaluateLayoutExpression#trees', t => {
  for (const tc of EVALUATE_TEST_CASES) {
    const result = evaluateLayoutExpression(tc.expression, tc.extent);
    t.equal(result, tc.result, `evaluateLayoutExpression ${tc.title} returned expected result`);
  }
  t.end();
});
