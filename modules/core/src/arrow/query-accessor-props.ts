// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Table, Vector} from 'apache-arrow';
import type {Expression} from '@math.gl/expressions';

type Call = Expression & {
  type: 'CallExpression';
  callee: {type: 'Identifier'; name: string};
  arguments: Expression[];
};

/** Rewrite local convenience constructors into math.gl's typed Arrow expressions. */
function normalizeAccessorExpression(expression: Expression): Expression {
  const node = expression as Call;
  if (node.type !== 'CallExpression' || node.callee?.type !== 'Identifier') return expression;
  const name = node.callee.name.toUpperCase();
  const types: Record<string, {width: number; target: string}> = {
    FLOAT32X2: {width: 2, target: 'array_float32'},
    FLOAT32X3: {width: 3, target: 'array_float32'},
    FLOAT32X4: {width: 4, target: 'array_float32'},
    FLOAT64X2: {width: 2, target: 'array_float64'},
    FLOAT64X3: {width: 3, target: 'array_float64'},
    FLOAT64X4: {width: 4, target: 'array_float64'},
    RGBA8: {width: 4, target: 'PACK_UNORM8'}
  };
  const constructor = types[name];
  if (!constructor) return expression;
  if (node.arguments.length !== constructor.width) {
    throw new Error(`${name} requires exactly ${constructor.width} arguments`);
  }
  const args = node.arguments.map(normalizeAccessorExpression);
  const array: Call = {
    type: 'CallExpression',
    sqlFunction: true,
    callee: {type: 'Identifier', name: name === 'RGBA8' ? 'array_float64' : constructor.target},
    arguments: args
  } as Call;
  return name === 'RGBA8'
    ? ({
        type: 'CallExpression',
        sqlFunction: true,
        callee: {type: 'Identifier', name: 'PACK_UNORM8'},
        arguments: [array]
      } as Call)
    : array;
}

/** One result per input row, reusable through accessor index callbacks. */
export async function evaluateQueryAccessorProps(
  table: Table,
  expressions: Readonly<Record<string, string>>
): Promise<Record<string, (object: unknown, info: {index: number}) => unknown>> {
  const [{parseSQLExpression}, {compileArrowExpression}] = await Promise.all([
    import('@math.gl/expressions/sql'),
    import('@math.gl/expressions/arrow')
  ]);
  const accessors: Record<string, (object: unknown, info: {index: number}) => unknown> =
    Object.create(null);
  for (const [name, text] of Object.entries(expressions)) {
    const ast = normalizeAccessorExpression(parseSQLExpression(text));
    const vector: Vector = compileArrowExpression(ast, {inputSchema: table.schema}).evaluateTable(table);
    if (vector.length !== table.numRows) {
      throw new Error(`_queryProps.${name} must preserve the input row count`);
    }
    accessors[name] = (_object, {index}) => {
      const value = vector.get(index);
      // Arrow FixedSizeList rows expose nested vectors, while deck.gl accessors accept arrays.
      return value && typeof value === 'object' && typeof value.toArray === 'function'
        ? Array.from(value.toArray() as ArrayLike<number>)
        : value;
    };
  }
  return accessors;
}
