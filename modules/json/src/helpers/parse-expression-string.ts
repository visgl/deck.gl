// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {get} from '../utils/get';

// expression-eval: Small jsep based expression parser that supports array and object indexing
import {parse, eval as evaluate} from '../expression-eval/expression-eval';

type AccessorFunction = (row: Record<string, unknown>) => unknown;

const cachedExpressionMap: Record<string, AccessorFunction> = {
  // Identity function
  '-': object => object
};

/**
 * Generates an accessor function from a JSON string
 * '-' : x => x
 * 'a.b.c': x => x.a.b.c
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

/** Helper function to search all nodes in AST returned by expressionEval */
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
