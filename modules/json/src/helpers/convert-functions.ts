// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseExpressionString} from './parse-expression-string';

import {FUNCTION_IDENTIFIER} from '../syntactic-sugar';
import {type JSONConfiguration} from '../json-configuration';

/**
 * Checks whether a prop value should be interpreted as an accessor expression.
 * @param value Prop value to inspect.
 * @returns `true` if the value has the function identifier prefix.
 */
function hasFunctionIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(FUNCTION_IDENTIFIER);
}

/**
 * Removes the function identifier prefix from an accessor expression string.
 * @param value Accessor expression with the configured prefix.
 * @returns The expression body without the prefix.
 */
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
