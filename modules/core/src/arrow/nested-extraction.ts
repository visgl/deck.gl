// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ArrowTableFunction} from '@math.gl/sql/arrow';
import {validateExpressionAST, type Expression} from '@math.gl/sql/expressions';

/** Renames custom extraction overrides to names available to the math.gl registry. */
export function aliasNestedExtractionOverrides(
  expression: Expression,
  functions: readonly ArrowTableFunction[]
): {expression: Expression; functions: readonly ArrowTableFunction[]} {
  const aliases = new Map<string, string>();
  const usedNames = new Set(functions.map(fn => fn.name.toUpperCase()));
  const declarations = functions.map(fn => {
    const name = fn.name.toUpperCase();
    if (name !== 'LIST_EXTRACT' && name !== 'STRUCT_EXTRACT') {
      return fn;
    }
    let alias = aliases.get(name);
    if (!alias) {
      alias = `__deck_${name}`;
      while (usedNames.has(alias.toUpperCase())) {
        alias += '_';
      }
      aliases.set(name, alias);
      usedNames.add(alias.toUpperCase());
    }
    return {...fn, name: alias};
  });
  if (!aliases.size) {
    return {expression, functions};
  }
  validateExpressionAST(expression);
  return {expression: renameCalls(expression, aliases), functions: declarations};
}

/** Rewrites named calls only, leaving matching column names and literals intact. */
function renameCalls(expression: Expression, aliases: ReadonlyMap<string, string>): Expression {
  const rename = (child: {type: string}) => renameCalls(child as Expression, aliases);
  switch (expression.type) {
    case 'BinaryExpression':
    case 'LogicalExpression':
      return {...expression, left: rename(expression.left), right: rename(expression.right)};
    case 'UnaryExpression':
      return {...expression, argument: rename(expression.argument)};
    case 'ArrayExpression':
      return {
        ...expression,
        elements: expression.elements.map(element => element && rename(element))
      };
    case 'ConditionalExpression':
      return {
        ...expression,
        test: rename(expression.test),
        consequent: rename(expression.consequent),
        alternate: rename(expression.alternate)
      };
    case 'CallExpression': {
      const {callee} = expression;
      const name =
        callee.type === 'Identifier' && typeof callee.name === 'string'
          ? aliases.get(callee.name.toUpperCase())
          : undefined;
      return {
        ...expression,
        callee: name ? {type: 'Identifier', name} : callee,
        arguments: expression.arguments.map(rename)
      };
    }
    default:
      return expression;
  }
}
