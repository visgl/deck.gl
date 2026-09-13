// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSONConfiguration} from '../json-configuration';

/**
 * Executes a configured JSON function reference.
 * @param targetFunction Function name resolved from JSON.
 * @param props Props passed to the configured function.
 * @param configuration Active conversion configuration.
 * @returns The function result, or `null` if the function is not registered.
 */
export function executeFunction(
  targetFunction: string,
  props: Record<string, unknown>,
  configuration: JSONConfiguration
) {
  // Find the function
  const matchedFunction = configuration.config.functions[targetFunction];

  // Check that the function is in the configuration.
  if (!matchedFunction) {
    const {log} = configuration.config; // eslint-disable-line
    if (log) {
      const stringProps = JSON.stringify(props, null, 0).slice(0, 40);
      log.warn(`JSON converter: No registered function ${targetFunction}(${stringProps}...)  `);
    }
    return null;
  }

  return matchedFunction(props);
}
