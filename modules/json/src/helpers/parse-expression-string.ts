// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {get} from '../utils/get';

// expression-eval: Small jsep based expression parser that supports array and object indexing
import {parse, eval as evaluate} from '../expression-eval/expression-eval';

/**
 * Accessor function produced from a parsed JSON expression string.
 */
type AccessorFunction = (row: Record<string, unknown>) => unknown;

/**
 * Cache of compiled accessor expressions keyed by their original string form.
 */
const cachedExpressionMap: Record<string, AccessorFunction> = {
  // Identity function
  '-': object => object
};

/**
 * Generates an accessor function from a JSON string.
 * `-` maps to the identity accessor and `a.b.c` maps to nested property access.
 * @param propValue Expression string to compile.
 * @param configuration Active conversion configuration.
 * @returns A callable accessor compiled from the expression string.
 */
export function parseExpressionString(
  propValue: string,
  configuration?
): (row: Record<string, unknown>) => unknown {
  // NOTE: Can be null which represents invalid function. Return null so that prop can be omitted
  if (propValue in cachedExpressionMap) {
    return cachedExpressionMap[propValue];
  }

  let func;
  // Compile with expression-eval
  const ast = parse(propValue);
  if (ast.type === 'Identifier') {
    func = row => {
      return get(row, propValue);
    };
  } else {
    // NOTE: To avoid security risks, the arguments passed to the
    // compiled expression must only give access to pure data (no globals etc)
    // We disable function call syntax
    traverse(ast, node => {
      if (node.type === 'CallExpression') {
        throw new Error('Function calls not allowed in JSON expressions');
      }
    });
    // TODO Something like `expressionEval.eval(ast, {row});` would be useful for unpacking arrays
    func = row => {
      return evaluate(ast, row);
    };
  }

  // Cache the compiled function
  cachedExpressionMap[propValue] = func;
  return func;
}

/**
 * Recursively visits nodes in an expression AST.
 * @param node AST node or node array to traverse.
 * @param visitor Callback invoked for each visited AST node.
 */
// eslint-disable-next-line complexity
function traverse(node, visitor) {
  if (Array.isArray(node)) {
    node.forEach(element => traverse(element, visitor));
  } else if (node && typeof node === 'object') {
    if (node.type) {
      visitor(node);
    }
    for (const key in node) {
      traverse(node[key], visitor);
    }
  }
}
