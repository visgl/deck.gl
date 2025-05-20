// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseExpressionString} from './parse-expression-string';

import {FUNCTION_IDENTIFIER} from '../syntactic-sugar';
import {type JSONConfiguration } from '../json-configuration';

function hasFunctionIdentifier(value) {
  return typeof value === 'string' && value.startsWith(FUNCTION_IDENTIFIER);
}

function trimFunctionIdentifier(value) {
  return value.replace(FUNCTION_IDENTIFIER, '');
}

/**
 * Tries to determine if any props are "function valued"
 * and if so convert their string values to functions
 */ 
export function convertFunctions(props, configuration: JSONConfiguration) {
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
