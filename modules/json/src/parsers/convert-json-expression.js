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
      const compiledFunc = expressionEval.compile(propValue);
      // NOTE: To avoid security risks, the arguments passed to the
      // compiled expresion must only give access to pure data (no globals etc)
      // TODO - disable function call syntax?
      func = isAccessor
        ? row => compiledFunc({row})
        : // TBD - how do we pass args to general (non-accessor) functions?
          args => compiledFunc({args});
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
