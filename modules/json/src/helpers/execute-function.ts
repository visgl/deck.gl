// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSONConfiguration} from '../json-configuration';

/**
 * Attempt to execute a function
 */
export function executeFunction(targetFunction, props, configuration: JSONConfiguration) {
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
