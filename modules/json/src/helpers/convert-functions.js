import parseExpressionString from './parse-expression-string';

import {FUNCTION_IDENTIFIER} from '../syntactic-sugar';

function hasFunctionIdentifier(value) {
  return typeof value === 'string' && value.startsWith(FUNCTION_IDENTIFIER);
}

function trimFunctionIdentifier(value) {
  return value.replace(FUNCTION_IDENTIFIER, '');
}

// Try to determine if any props are function valued
// and if so convert their string values to functions
export default function convertFunctions(props, configuration) {
  // Use deck.gl prop types if available.
  const replacedProps = {};
  for (const propName in props) {
    let propValue = props[propName];

    // Parse string valued expressions
    const isFunction = hasFunctionIdentifier(propValue);

    if (isFunction) {
      // Parse string as "expression", return equivalent JavaScript function
      propValue = trimFunctionIdentifier(propValue);
      propValue = parseExpressionString(propValue, configuration);
    }
    replacedProps[propName] = propValue;
  }

  return replacedProps;
}
