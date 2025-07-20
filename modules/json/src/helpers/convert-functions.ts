// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseExpressionString} from './parse-expression-string';

import {FUNCTION_IDENTIFIER} from '../syntactic-sugar';
import {type JSONConfiguration} from '../json-configuration';

function hasFunctionIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(FUNCTION_IDENTIFIER);
}

function trimFunctionIdentifier(value: string): string {
  return value.replace(FUNCTION_IDENTIFIER, '');
}

/**
 * Tries to determine if any props are "function valued"
 * and if so convert their string values to functions
 */
export function convertFunctions(
  props: Record<string, unknown>,
  configuration: JSONConfiguration
): Record<string, unknown> {
  // Use deck.gl prop types if available.
  const replacedProps = {};
  for (const propName in props) {
    let propValue = props[propName];

    // Parse string valued expressions
    if (hasFunctionIdentifier(propValue)) {
      // Parse string as "expression", return equivalent JavaScript function
      const trimmedFunctionIdentifier = trimFunctionIdentifier(propValue);
      propValue = parseExpressionString(trimmedFunctionIdentifier, configuration);
    }

    replacedProps[propName] = propValue;
  }

  return replacedProps;
}
