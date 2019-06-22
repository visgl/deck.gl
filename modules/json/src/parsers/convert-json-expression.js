import {log} from '@deck.gl/core';
import {get} from '../utils/get';

// expression-eval: Small jsep based expression parser that supports array and object indexing
import expressionEval from 'expression-eval';

const SINGLE_IDENTIFIER_REGEX = /^\s*[A-Za-z]+\s*$/;

const cachedExpressionMap = {
  '-': object => object
};

// Calculates an accessor function from a JSON string
// '-' : x => x
// 'a.b.c': x => x.a.b.c
export default function convertJSONExpression(propValue, configuration, isAccessor) {
  // NOTE: Can be null which represents invalid function. Return null so that prop can be ommitted
  if (propValue in cachedExpressionMap) {
    return cachedExpressionMap[propValue];
  }

  let func;
  // TODO - backwards compatibility for v6 JSON API: (simple identifier evaluates to row[string])
  // TODO - Check may not be needed - syntax could overlap with expression-eval?
  const isSingleIdentifier =
    isAccessor &&
    SINGLE_IDENTIFIER_REGEX.test(propValue) &&
    propValue !== 'true' &&
    propValue !== 'false';

  if (isSingleIdentifier) {
    func = row => get(row, propValue);
  } else {
    // Compile with expression-eval
    try {
      const ast = expressionEval.parse(propValue);
      // NOTE: To avoid security risks, the arguments passed to the
      // compiled expresion must only give access to pure data (no globals etc)
      // We disable function call syntax?
      traverse(ast, node => {
        if (node.type === 'CallExpression') {
          throw new Error('Function calls not allowed in JSON expressions');
        }
      });
      func = isAccessor
        ? row => expressionEval.eval(ast, {row})
        : // TBD - how do we pass args to general (non-accessor) functions?
          args => expressionEval.eval(ast, {args});
    } catch (error) {
      // Report error and store marker to avoid recompiling invalid func?
      log.warn(`Failed to compile expression ${propValue}`);
      func = null;
    }
  }

  // Cache the compiled function
  cachedExpressionMap[propValue] = func;
  return func;
}

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
