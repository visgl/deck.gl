// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Table} from 'apache-arrow';

type ScalarNode = {
  type: string;
  name?: string;
  value?: unknown;
  operator?: string;
  left?: ScalarNode;
  right?: ScalarNode;
  argument?: ScalarNode;
  callee?: {type: string; name: string};
  arguments?: ScalarNode[];
};

const REDUCTIONS = new Set(['MIN', 'MAX', 'AVG', 'SUM', 'COUNT']);

/**
 * Evaluates numeric, aggregate-derived layer properties against an Arrow table.
 * Keep SQL and Arrow dependencies behind this optional, lazily loaded boundary.
 */
export async function evaluateQueryProps(
  input: Table,
  queries: Readonly<Record<string, string>>
): Promise<Record<string, number>> {
  const [{parseSQLExpression}, {compileArrowAggregates}, {evaluate}] = await Promise.all([
    import('@math.gl/expressions/sql'),
    import('@math.gl/expressions/arrow'),
    import('@math.gl/expressions')
  ]);

  const aggregates: Record<string, {operation: 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT'; expression?: any}> =
    Object.create(null);
  let index = 0;

  const replaceAggregates = (node: ScalarNode): ScalarNode => {
    if (node.type === 'CallExpression') {
      const name = node.callee?.name?.toUpperCase();
      if (!name || !REDUCTIONS.has(name)) {
        throw new Error(`_queryProps only supports numeric operators and aggregate functions: ${name}`);
      }
      if (!Array.isArray(node.arguments) || node.arguments.length > 1) {
        throw new Error(`${name} accepts exactly one expression`);
      }
      if (node.arguments.length === 0 && name !== 'COUNT') {
        throw new Error(`${name} requires an input expression`);
      }
      const key = `__aggregate_${index++}`;
      aggregates[key] = {
        operation: name as 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT',
        ...(node.arguments.length ? {expression: node.arguments[0]} : {})
      };
      return {type: 'Identifier', name: key};
    }
    if (node.type === 'Identifier') {
      throw new Error('_queryProps column references must appear inside aggregates');
    }
    if (node.type === 'Literal') {
      if (typeof node.value !== 'number' || !Number.isFinite(node.value)) {
        throw new Error('_queryProps requires finite numeric literals');
      }
      return node;
    }
    if (node.type === 'UnaryExpression' && node.argument && ['+', '-'].includes(node.operator!)) {
      return {...node, argument: replaceAggregates(node.argument)};
    }
    if (
      node.type === 'BinaryExpression' && node.left && node.right &&
      ['+', '-', '*', '/'].includes(node.operator!)
    ) {
      return {...node, left: replaceAggregates(node.left), right: replaceAggregates(node.right)};
    }
    throw new Error(`Unsupported _queryProps scalar expression: ${node.type}`);
  };

  const expressions = Object.fromEntries(
    Object.entries(queries).map(([name, sql]) => {
      if (typeof sql !== 'string' || !sql.trim()) {
        throw new Error(`_queryProps.${name} requires a SQL expression string`);
      }
      return [name, replaceAggregates(parseSQLExpression(sql) as ScalarNode)];
    })
  );
  const results = Object.keys(aggregates).length
    ? compileArrowAggregates(aggregates, {inputSchema: input.schema}).evaluate(input)
    : {};

  return Object.fromEntries(
    Object.entries(expressions).map(([name, expression]) => {
      const value = evaluate(expression as any, results);
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`_queryProps.${name} must evaluate to a finite number`);
      }
      return [name, value];
    })
  );
}
